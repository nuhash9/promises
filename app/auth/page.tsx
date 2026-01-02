import { redirect } from 'next/navigation';
import { getCurrentUser, fetchUsers } from '@/lib/actions';
import AuthForm from './AuthForm';

export default async function AuthPage() {
  const user = await getCurrentUser();
  
  if (user) {
    redirect('/');
  }

  const users = await fetchUsers();

  return (
    <div className="max-w-md mx-auto mt-12">
      <AuthForm existingUsers={users} />
    </div>
  );
}
