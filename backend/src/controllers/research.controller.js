const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// 1. Submit New Research
exports.submitResearch = async (req, res) => {
  try {
    const { 
      title, abstract, keywords, co_authors, coAuthors, 
      category, file_url, file_name, file_size 
    } = req.body;
    
    const file = req.file; 
    const userId = req.user.id;

    if (!file && !file_url) return res.status(400).json({ error: 'Research file is required.' });
    if (!title || !abstract || !category) return res.status(400).json({ error: 'Required fields missing.' });

    let finalFileUrl = file_url;
    let finalFileName = file_name;
    let finalFileSize = file_size;

    // Handle Physical Upload
    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('research-papers')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('research-papers')
        .getPublicUrl(fileName);
        
      finalFileUrl = publicUrl;
      finalFileName = file.originalname;
      finalFileSize = file.size;
    }

    let normalizedKeywords = [];
    if (Array.isArray(keywords)) normalizedKeywords = keywords;
    else if (typeof keywords === 'string') normalizedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k);

    // Database Insert
    const { data: research, error: dbError } = await supabase
      .from('research_papers')
      .insert([{
        title, abstract, keywords: normalizedKeywords,
        co_authors: co_authors || coAuthors || null,
        category, author_id: userId,
        file_url: finalFileUrl, file_name: finalFileName, file_size: finalFileSize,
        status: 'pending'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // Notify Staff
    const { data: staffUsers } = await supabase.from('users').select('id').ilike('role', 'staff');
    if (staffUsers?.length > 0) {
      const notifications = staffUsers.map(staff => ({
        user_id: staff.id, research_id: research.id, type: 'submission',
        title: 'New Research Submission', message: `${req.user.email} submitted "${title}"`
      }));
      await supabase.from('notifications').insert(notifications);
    }

    res.status(201).json({ message: 'Research submitted successfully', research });

  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 2. Get My Research
exports.getMyResearch = async (req, res) => {
  try {
    const userId = req.user.id;
    // CRITICAL: Ensure we get everything owned by this user
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ papers: papers || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Get All Research (Admin/Staff)
exports.getAllResearch = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('research_papers')
      .select('*, users:author_id(full_name, email)')
      .order('created_at', { ascending: false }); // consistent sorting

    if (status) query = query.eq('status', status);

    const { data: papers, error } = await query;
    if (error) throw error;
    res.json({ papers: papers || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Get Research by ID
exports.getResearchById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: paper, error } = await supabase
      .from('research_papers')
      .select('*, users:author_id(full_name, email)')
      .eq('id', id)
      .single();

    if (error || !paper) return res.status(404).json({ error: 'Paper not found' });

    // Increment view count
    await supabase.from('research_papers')
      .update({ view_count: (paper.view_count || 0) + 1 }).eq('id', id);

    res.json({ paper });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. Approve Research (FIXED: PREVENTS STEALING OWNERSHIP)
exports.approveResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body; // ensure frontend sends 'comments' or 'comment'
    const reviewerId = req.user.id;
    const reviewerRole = (req.user.role || '').toLowerCase();

    // 1. Fetch current status
    const { data: paper } = await supabase
      .from('research_papers')
      .select('status, title, author_id')
      .eq('id', id)
      .single();

    if (!paper) return res.status(404).json({ error: 'Research paper not found' });

    // 2. Logic for Workflow
    let newStatus = '';
    let notificationMessage = '';

    if (paper.status === 'under_review') {
      newStatus = 'approved';
      notificationMessage = `Congratulations! Your research "${paper.title}" has been published.`;
    } 
    else if (paper.status === 'pending') {
      if (reviewerRole === 'admin') {
        newStatus = 'approved';
        notificationMessage = `Admin published research "${paper.title}".`;
      } else {
        newStatus = 'under_review';
        notificationMessage = `Staff approved "${paper.title}". Pending final Admin approval.`;
      }
    } 
    else if (paper.status === 'approved') {
       return res.status(400).json({ error: 'Paper is already published.' });
    }
    else {
       newStatus = 'under_review'; // Fallback
    }

    // 3. SAFE UPDATE - ONLY TOUCH STATUS & TIMESTAMPS
    // We explicitly create an update object that DOES NOT contain 'author_id'
    const updatePayload = {
        status: newStatus,
        updated_at: new Date().toISOString()
    };
    
    // Only set published date if actually published
    if (newStatus === 'approved') {
        updatePayload.published_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('research_papers')
      .update(updatePayload) // <--- CRITICAL FIX: No author_id here
      .eq('id', id);

    if (error) throw error;

    // 4. Log Workflow
    await supabase.from('approval_workflow').insert([{ 
      research_id: id, reviewer_id: reviewerId, reviewer_role: reviewerRole, 
      status: newStatus, comments: comments || 'Approved'
    }]);

    // 5. Notifications
    let targetAudience = [];
    if (newStatus === 'approved') {
       targetAudience = [{ id: paper.author_id }];
    } else if (newStatus === 'under_review') {
       const { data: admins } = await supabase.from('users').select('id').ilike('role', 'admin');
       targetAudience = admins || [];
    }

    if (targetAudience.length > 0) {
      const notifs = targetAudience.map(t => ({
        user_id: t.id, research_id: id, 
        type: newStatus === 'approved' ? 'published' : 'admin_review',
        title: newStatus === 'approved' ? 'Research Published' : 'Admin Review Required',
        message: notificationMessage
      }));
      await supabase.from('notifications').insert(notifs);
    }

    res.json({ 
      message: newStatus === 'approved' ? 'Research Published Successfully' : 'Approved and sent to Admin',
      status: newStatus 
    });

  } catch (error) {
    console.error('Approve research error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 6. Reject Research
exports.rejectResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;

    const { data: paper } = await supabase
      .from('research_papers')
      .select('author_id, title').eq('id', id).single();

    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const { error } = await supabase
      .from('research_papers')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);

    if (error) throw error;

    await supabase.from('approval_workflow').insert([{ 
      research_id: id, reviewer_id: reviewerId, reviewer_role: req.user.role, 
      status: 'rejected', comments: reason
    }]);

    await supabase.from('notifications').insert([{
      user_id: paper.author_id, research_id: id, type: 'rejected',
      title: 'Submission Rejected', message: `Your research "${paper.title}" was rejected. Reason: ${reason}`
    }]);

    res.json({ message: 'Research rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 7. Request Revision
exports.requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body; // Ensure frontend sends 'notes'
    const reviewerId = req.user.id;

    const { data: paper } = await supabase
      .from('research_papers')
      .select('author_id, title').eq('id', id).single();

    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const { error } = await supabase
      .from('research_papers')
      .update({ status: 'revision_required', revision_notes: notes })
      .eq('id', id);

    if (error) throw error;

    await supabase.from('approval_workflow').insert([{ 
      research_id: id, reviewer_id: reviewerId, reviewer_role: req.user.role, 
      status: 'revision_required', comments: notes
    }]);

    await supabase.from('notifications').insert([{
      user_id: paper.author_id, research_id: id, type: 'revision',
      title: 'Revision Requested', message: `Action required for "${paper.title}": ${notes}`
    }]);

    res.json({ message: 'Revision requested successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 8. Get Published Research (Public)
exports.getPublishedResearch = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = supabase.from('research_papers').select('*, users:author_id(full_name, email)').eq('status', 'approved');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data: papers, error } = await query;
    if (error) throw error;

    res.json({ papers: papers || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 9. Get Categories
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('research_categories').select('*').order('name');
    if (error) throw error;
    res.json({ categories: categories || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 10. Resubmit Research
exports.resubmitResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, abstract, keywords, category, 
      file_url, file_name, file_size, co_authors 
    } = req.body;
    const userId = req.user.id;
    
    const { data: existingPaper } = await supabase
      .from('research_papers').select('author_id').eq('id', id).single();

    if (!existingPaper || existingPaper.author_id !== userId) {
      return res.status(403).json({ error: "Unauthorized to edit this paper" });
    }

    let normalizedKeywords = [];
    if (Array.isArray(keywords)) normalizedKeywords = keywords;
    else if (typeof keywords === 'string') normalizedKeywords = keywords.split(',').map(k => k.trim());

    const { data, error } = await supabase
      .from('research_papers')
      .update({
        title, abstract, keywords: normalizedKeywords, category, co_authors,
        file_url, file_name, file_size,
        status: 'pending', // Resets cycle to Staff
        updated_at: new Date().toISOString()
      })
      .eq('id', id).select();

    if (error) throw error;
    res.json({ message: 'Research resubmitted successfully', research: data[0] });

  } catch (error) {
    console.error('Resubmit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};