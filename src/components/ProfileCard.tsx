import { User2, Pencil } from 'lucide-react';
import { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
  onEditField: (field: 'carModel' | 'carPlate') => void;
}

export default function ProfileCard({ profile, onEditField }: ProfileCardProps) {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-4">
        {profile.pictureUrl ? (
          <img
            src={profile.pictureUrl}
            alt="Foto de perfil"
            className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500">
            <User2 className="w-10 h-10 text-emerald-600" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h2>
          <p className="text-gray-600 dark:text-gray-300">Email : {profile.email}</p>
          {profile.phone && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Tel : {profile.phone}</p>
          )}
        </div>
      </div>
      <div className="mt-6 space-y-2">
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Auto :</span>
          <span className="text-gray-600 dark:text-gray-300">{profile.carModel}</span>
          <button
            onClick={() => onEditField('carModel')}
            className="ml-2 text-sm text-emerald-500 hover:underline"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Patente :</span>
          <span className="text-gray-600 dark:text-gray-300">{profile.carPlate}</span>
          <button
            onClick={() => onEditField('carPlate')}
            className="ml-2 text-sm text-emerald-500 hover:underline"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Miembro desde :</span>
          <span className="text-gray-600 dark:text-gray-300">
            {new Date(profile.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}