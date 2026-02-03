import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint creates the initial admin user
// Should only be used once during setup
export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Use service role to create user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if admin already exists
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingStaff && existingStaff.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create staff record
    const { error: staffError } = await supabase.from('staff').insert({
      user_id: authData.user.id,
      name: name || 'مدير النظام',
      role: 'admin',
      is_active: true,
    });

    if (staffError) {
      // Rollback: delete the auth user if staff creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if setup is needed
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: staff } = await supabase
      .from('staff')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    return NextResponse.json({
      setupRequired: !staff || staff.length === 0,
    });
  } catch {
    return NextResponse.json({ setupRequired: true });
  }
}
