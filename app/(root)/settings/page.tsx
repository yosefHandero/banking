import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import HeaderBox from '@/components/HeaderBox';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <HeaderBox
        type="title"
        title="Settings"
        subtext="Manage your account preferences"
      />

      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
          <h2 className="text-18 font-semibold text-gray-900">Profile Information</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.firstName}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.lastName}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-class"
                value={userInfo.email}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.address1}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">City</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.city}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">State</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.state}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="input-class"
                value={userInfo.postalCode}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-form">
          <h2 className="text-18 font-semibold text-gray-900">Preferences</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-14 font-semibold text-gray-900">Email Notifications</p>
                <p className="text-12 text-gray-600">Receive email updates about your account</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-14 font-semibold text-gray-900">Spending Alerts</p>
                <p className="text-12 text-gray-600">Get notified when you exceed budget limits</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-14 font-semibold text-gray-900">Transaction Notifications</p>
                <p className="text-12 text-gray-600">Receive notifications for large transactions</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button className="form-btn">Save Changes</Button>
          <Button variant="ghost" className="text-red-600 hover:text-red-700">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

