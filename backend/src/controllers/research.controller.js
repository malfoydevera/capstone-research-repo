const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Submit new research or update existing revision
exports.submitResearch = async (req, res) => {
  try {
    // 1. Capture 'id' from req.body to detect if this is an update/revision
    const { id, title, abstract, keywords, coAuthors, category } = req.body;
    const file = req.file;
    const userId = req.user.id;

    // Validation: File is required for new submissions
    if (!id && !file) {
      return res.status(400).json({ error: 'Research file is required' });
    }

    if (!title || !abstract || !category) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    let fileData = {};

    // 2. Upload new file if one was provided
    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('research-papers')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true // Allow overwriting if a specific path is reused
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('research-papers')
        .getPublicUrl(fileName);

      fileData = {
        file_url: publicUrl,
        file_name: file.originalname,
        file_size: file.size
      };
    }

    // 3. Use .upsert() to update existing record or insert new one
    // If 'id' is present, Supabase updates that record; otherwise it inserts
    const { data: research, error: dbError } = await supabase
      .from('research_papers')
      .upsert({
        ...(id && { id }), // Include id only if it's an update
        title,
        abstract,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
        co_authors: coAuthors || null,
        category,
        author_id: userId,
        status: 'pending', // Reset status to pending upon submission/revision
        ...fileData // Spread new file info if a file was uploaded
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save research data' });
    }

    // 4. Notification logic (consistent with original)
    const { data: author } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    const { data: staffUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'staff');

    if (staffUsers && staffUsers.length > 0) {
      const notifications = staffUsers.map(staff => ({
        user_id: staff.id,
        research_id: research.id,
        type: 'submission',
        title: id ? 'Research Revised' : 'New Research Submission',
        message: `${author?.full_name || author?.email} ${id ? 'resubmitted' : 'submitted'} "${title}" for review`
      }));

      await supabase.from('notifications').insert(notifications);
    }

    res.status(id ? 200 : 201).json({
      message: id ? 'Research updated successfully' : 'Research submitted successfully',
      research
    });
  } catch (error) {
    console.error('Submit research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's research papers
exports.getMyResearch = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ papers });
  } catch (error) {
    console.error('Get my research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all research papers (staff/admin)
exports.getAllResearch = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('research_papers')
      .select(`
        *,
        author:users!author_id (
          id,
          full_name,
          email
        )
      `)
      .order('submission_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: papers, error } = await query;

    if (error) throw error;

    const transformedPapers = papers.map(paper => ({
      ...paper,
      users: paper.author
    }));

    res.json({ papers: transformedPapers });
  } catch (error) {
    console.error('Get all research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single research paper
exports.getResearchById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: paper, error } = await supabase
      .from('research_papers')
      .select(`
        *,
        author:users!author_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error || !paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    await supabase
      .from('research_papers')
      .update({ view_count: (paper.view_count || 0) + 1 })
      .eq('id', id);

    const transformedPaper = {
      ...paper,
      users: paper.author
    };

    res.json({ paper: transformedPaper });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve research
exports.approveResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;

    const { data: paper, error: fetchError } = await supabase
      .from('research_papers')
      .select('*, users:author_id(full_name, email)')
      .eq('id', id)
      .single();

    if (fetchError || !paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    let newStatus;
    let notificationMessage;

    if (reviewerRole === 'staff' && paper.status === 'pending') {
      newStatus = 'under_review';
      notificationMessage = 'Your research has been approved by staff and is now under admin review';
    } else if (reviewerRole === 'admin' && paper.status === 'under_review') {
      newStatus = 'approved';
      notificationMessage = 'Congratulations! Your research has been approved and published';
    } else {
      return res.status(400).json({ error: 'Invalid approval workflow' });
    }

    const { error: updateError } = await supabase
      .from('research_papers')
      .update({ 
        status: newStatus,
        published_date: newStatus === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (updateError) throw updateError;

    await supabase.from('approval_workflow').insert([{
      research_id: id,
      reviewer_id: reviewerId,
      reviewer_role: reviewerRole,
      status: 'approved',
      comments: comments || null
    }]);

    await supabase.from('notifications').insert([{
      user_id: paper.author_id,
      research_id: id,
      type: 'approval',
      title: 'Research Approved',
      message: notificationMessage
    }]);

    if (newStatus === 'under_review') {
      const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          research_id: id,
          type: 'submission',
          title: 'Research Ready for Final Approval',
          message: `"${paper.title}" has been reviewed by staff and needs your approval`
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
    }

    res.json({ message: 'Research approved successfully', status: newStatus });
  } catch (error) {
    console.error('Approve research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject research
exports.rejectResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;

    if (!reason) return res.status(400).json({ error: 'Rejection reason is required' });

    const { data: paper } = await supabase.from('research_papers').select('author_id, title').eq('id', id).single();
    if (!paper) return res.status(404).json({ error: 'Research paper not found' });

    await supabase.from('research_papers').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);

    await supabase.from('approval_workflow').insert([{
      research_id: id, reviewer_id: reviewerId, reviewer_role: reviewerRole, status: 'rejected', comments: reason
    }]);

    await supabase.from('notifications').insert([{
      user_id: paper.author_id, research_id: id, type: 'rejection', title: 'Research Rejected', message: `Your research "${paper.title}" has been rejected. Reason: ${reason}`
    }]);

    res.json({ message: 'Research rejected' });
  } catch (error) {
    console.error('Reject research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Request revision
exports.requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;

    if (!notes) return res.status(400).json({ error: 'Revision notes are required' });

    const { data: paper } = await supabase.from('research_papers').select('author_id, title').eq('id', id).single();
    if (!paper) return res.status(404).json({ error: 'Research paper not found' });

    await supabase.from('research_papers').update({ status: 'revision_required', revision_notes: notes }).eq('id', id);

    await supabase.from('approval_workflow').insert([{
      research_id: id, reviewer_id: reviewerId, reviewer_role: reviewerRole, status: 'revision_required', comments: notes
    }]);

    await supabase.from('notifications').insert([{
      user_id: paper.author_id, research_id: id, type: 'revision', title: 'Revision Required', message: `Your research "${paper.title}" requires revision. Notes: ${notes}`
    }]);

    res.json({ message: 'Revision requested' });
  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get published research (public)
exports.getPublishedResearch = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = supabase.from('research_papers').select(`*, author:users!author_id (id, full_name, email)`).eq('status', 'approved').order('published_date', { ascending: false });

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);

    const { data: papers, error } = await query;
    if (error) throw error;

    const transformedPapers = papers.map(paper => ({ ...paper, users: paper.author }));
    res.json({ papers: transformedPapers });
  } catch (error) {
    console.error('Get published research error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get research categories
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase.from('research_categories').select('*').order('name');
    if (error) throw error;
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};