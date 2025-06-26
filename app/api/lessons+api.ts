export async function GET(request: Request) {
  const url = new URL(request.url);
  const lessonId = url.searchParams.get('id');
  const category = url.searchParams.get('category');
  const difficulty = url.searchParams.get('difficulty');

  try {
    console.log('Lessons API called with params:', { lessonId, category, difficulty });
    
    // Test basic response first
    if (url.searchParams.get('test') === 'true') {
      return Response.json({ 
        message: 'API is working',
        timestamp: new Date().toISOString(),
        params: { lessonId, category, difficulty }
      });
    }
    
    // Check if Supabase is properly imported
    let supabase;
    try {
      const supabaseModule = await import('@/lib/supabase');
      supabase = supabaseModule.supabase;
      console.log('Supabase imported successfully');
    } catch (importError) {
      console.error('Failed to import Supabase:', importError);
      return Response.json({ 
        error: 'Database connection failed',
        details: importError.message 
      }, { status: 500 });
    }
    
    if (lessonId) {
      // Fetch specific lesson from Supabase
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return Response.json({ 
          error: 'Lesson not found',
          details: error.message 
        }, { status: 404 });
      }

      console.log('Fetched single lesson:', lesson);
      return Response.json(lesson);
    }

    // Fetch lessons with filters from Supabase
    let query = supabase.from('lessons').select('*').order('order_index');

    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ 
        error: 'Failed to fetch lessons',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Fetched lessons count:', lessons?.length || 0);
    console.log('Sample lesson structure:', lessons?.[0] ? {
      id: lessons[0].id,
      title: lessons[0].title,
      hasContent: !!lessons[0].content,
      hasQuestions: !!(lessons[0].content as any)?.questions,
      questionCount: (lessons[0].content as any)?.questions?.length || 0
    } : 'No lessons found');
    
    return Response.json(lessons || []);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const lessonData = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    const { data: newLesson, error } = await supabase
      .from('lessons')
      .insert([{
        ...lessonData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to create lesson', { status: 500 });
    }

    return Response.json(newLesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return new Response('Failed to create lesson', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('id');
    
    if (!lessonId) {
      return new Response('Lesson ID required', { status: 400 });
    }

    const updateData = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    const { data: updatedLesson, error } = await supabase
      .from('lessons')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to update lesson', { status: 500 });
    }
    
    return Response.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return new Response('Failed to update lesson', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get('id');
    
    if (!lessonId) {
      return new Response('Lesson ID required', { status: 400 });
    }

    const { supabase } = await import('@/lib/supabase');
    
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Failed to delete lesson', { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return new Response('Failed to delete lesson', { status: 500 });
  }
}