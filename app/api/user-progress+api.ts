export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const lessonId = url.searchParams.get('lessonId');

  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  try {
    const { supabase } = await import('@/lib/supabase');

    if (lessonId) {
      // Get progress for specific lesson
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        return new Response('Failed to fetch progress', { status: 500 });
      }

      // Return empty progress if not found
      if (!progress) {
        return Response.json({
          user_id: userId,
          lesson_id: lessonId,
          completed: false,
          progress: 0,
          time_spent: 0,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return Response.json(progress);
    }

    // Get all user progress
    const { data: allProgress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to fetch progress', { status: 500 });
    }

    return Response.json(allProgress || []);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let progressData;
    try {
      progressData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return Response.json({ 
        error: 'Invalid request body',
        details: parseError.message 
      }, { status: 400 });
    }
    
    const { userId, lessonId, completed, score, hearts, timestamp } = progressData;

    console.log('User progress API called with:', { userId, lessonId, completed, score });
    
    if (!userId || !lessonId) {
      return Response.json({ 
        error: 'User ID and Lesson ID required',
        received: { userId, lessonId }
      }, { status: 400 });
    }

    // Import Supabase with error handling
    let supabase;
    try {
      const supabaseModule = await import('@/lib/supabase');
      supabase = supabaseModule.supabase;
    } catch (importError) {
      console.error('Failed to import Supabase:', importError);
      return Response.json({ 
        error: 'Database connection failed',
        details: importError.message 
      }, { status: 500 });
    }

    // Check if progress already exists
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    let result;
    
    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error } = await supabase
        .from('user_progress')
        .update({
          completed,
          progress: completed ? 1.0 : (score / 15), // Assuming 15 questions per lesson
          time_spent: existingProgress.time_spent + 300, // Add 5 minutes per attempt
          completed_at: completed ? timestamp : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return Response.json({ 
          error: 'Failed to update progress',
          details: error.message 
        }, { status: 500 });
      }

      result = updatedProgress;
    } else {
      // Create new progress record
      const { data: newProgress, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          lesson_id: lessonId,
          completed,
          progress: completed ? 1.0 : (score / 15),
          time_spent: 300, // 5 minutes for first attempt
          completed_at: completed ? timestamp : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return Response.json({ 
          error: 'Failed to create progress',
          details: error.message 
        }, { status: 500 });
      }

      result = newProgress;
    }

    console.log('Progress updated successfully:', result);
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return Response.json({ 
      error: 'Failed to update progress',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const progressId = url.searchParams.get('id');
    
    if (!progressId) {
      return new Response('Progress ID required', { status: 400 });
    }

    const updateData = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    const { data: updatedProgress, error } = await supabase
      .from('user_progress')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to update progress', { status: 500 });
    }
    
    return Response.json(updatedProgress);
  } catch (error) {
    console.error('Error updating progress record:', error);
    return new Response('Failed to update progress', { status: 500 });
  }
}