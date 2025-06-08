'use client';
import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiMapPin, 
  FiPhone, 
  FiEdit3, 
  FiCamera,
  FiSave,
  FiX,
  FiUserCheck,
  FiShield,
  FiMessageCircle
} from 'react-icons/fi';
import axios from 'axios';

const ProfilePage = () => {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  
  // Récupérer l'ID depuis les paramètres ou utiliser l'ID de l'utilisateur actuel
  const profileUserId = params?.userId || user?.id;
  const isCurrentUser = !params?.userId || String(profileUserId) === String(user?.id);
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    localisation: '',
    phone_number: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let profileRes;
        
        if (isCurrentUser) {
          profileRes = await axios.get(`${apiUrl}/api/auth/users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          profileRes = await axios.get(`${apiUrl}/api/users/${profileUserId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        setUserProfile(profileRes.data);
        setEditForm({
          first_name: profileRes.data.first_name || '',
          last_name: profileRes.data.last_name || '',
          email: profileRes.data.email || '',
          bio: profileRes.data.bio || '',
          localisation: profileRes.data.localisation || '',
          phone_number: profileRes.data.phone_number || ''
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileUserId && token) {
      fetchUserProfile();
    }
  }, [profileUserId, token, isCurrentUser, apiUrl]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      email: userProfile?.email || '',
      bio: userProfile?.bio || '',
      localisation: userProfile?.localisation || '',
      phone_number: userProfile?.phone_number || ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`${apiUrl}/api/auth/users/me/`, editForm, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.status === 200) {
        setUserProfile(response.data);
        setIsEditing(false);
        // Optionnel: afficher un message de succès
        console.log('Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      // Optionnel: afficher un message d'erreur à l'utilisateur
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSendMessage = () => {
    // Rediriger vers la page de messages avec cet utilisateur
    router.push(`/messages?user=${profileUserId}`);
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expert':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'farmer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <FiShield className="w-4 h-4" />;
      case 'expert':
        return <FiUserCheck className="w-4 h-4" />;
      default:
        return <FiUser className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pt-20">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.first_name || userProfile?.last_name 
    ? `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim()
    : userProfile?.username;

  const joinDate = userProfile?.created_at 
    ? new Date(userProfile.created_at).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Non spécifié';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Boutons d'action dans le header */}
            <div className="absolute top-4 right-4 flex gap-2">
              {!isCurrentUser && (
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-200"
                  title="Envoyer un message"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span className="text-sm">Message</span>
                </button>
              )}
              {isCurrentUser && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200"
                  title="Modifier le profil"
                >
                  <FiEdit3 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative">
                {userProfile?.photo ? (
                  <img
                    src={userProfile.photo}
                    alt={userProfile.username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {userProfile?.username[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                {isCurrentUser && (
                  <button className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors">
                    <FiCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Name and Role */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {displayName}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userProfile?.role)}`}>
                  {getRoleIcon(userProfile?.role)}
                  {userProfile?.role || 'Utilisateur'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{userProfile?.username}
              </p>
            </div>

            {/* Action Buttons - uniquement pour l'utilisateur actuel en mode édition */}
            {isCurrentUser && isEditing && (
              <div className="flex justify-center gap-3 mb-6">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors duration-200"
                >
                  <FiSave className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-full transition-colors duration-200"
                >
                  <FiX className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiUser className="text-green-600" />
                Informations personnelles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  {isCurrentUser && isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {userProfile?.first_name || 'Non spécifié'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  {isCurrentUser && isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {userProfile?.last_name || 'Non spécifié'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Biographie
                </label>
                {isCurrentUser && isEditing ? (
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg min-h-[100px]">
                    {userProfile?.bio || 'Aucune biographie renseignée'}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiMail className="text-green-600" />
                Contact
              </h2>
              
              <div className="space-y-4">
                {/* Email - visible seulement pour le profil actuel ou si public */}
                {isCurrentUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FiMail className="text-green-600 w-5 h-5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          {userProfile?.email}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Téléphone - visible pour tous si renseigné */}
                {(userProfile?.phone_number || (isCurrentUser && isEditing)) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FiPhone className="text-green-600 w-5 h-5" />
                    <div className="flex-1">
                      {isCurrentUser && isEditing ? (
                        <input
                          type="tel"
                          name="phone_number"
                          value={editForm.phone_number}
                          onChange={handleInputChange}
                          placeholder="Numéro de téléphone"
                          className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          {userProfile?.phone_number || 'Non spécifié'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Localisation - visible pour tous si renseignée */}
                {(userProfile?.localisation || (isCurrentUser && isEditing)) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FiMapPin className="text-green-600 w-5 h-5" />
                    <div className="flex-1">
                      {isCurrentUser && isEditing ? (
                        <input
                          type="text"
                          name="localisation"
                          value={editForm.localisation}
                          onChange={handleInputChange}
                          placeholder="Localisation"
                          className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-white">
                          {userProfile?.localisation || 'Non spécifié'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informations du compte
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-green-600 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Membre depuis</p>
                    <p className="font-medium text-gray-900 dark:text-white">{joinDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FiUserCheck className="text-green-600 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Actif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Message Button for other users */}
            {!isCurrentUser && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <button
                  onClick={handleSendMessage}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  Envoyer un message
                </button>
              </div>
            )}

            {/* Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activité récente
              </h3>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                  Aucune activité récente
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;