import React, { useState } from 'react';
import { getInitials } from '../../utils/helper';

const ProfileInfo = ({ userInfo, onLogout }) => {
  // Provide a default value for userInfo to handle null or undefined cases
  //const fullName = userInfo?.fullName || "Guest User"; // Fallback name if userInfo or fullName is not available
  if (!userInfo || !userInfo.fullName) {
    // Render a placeholder or null
    return null; // or return a placeholder component or message
  }


  return (
    <div className='flex items-center gap-3'>
      <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
        {getInitials(userInfo.fullName)}
      </div>
      <div>
        <p className='text-sm font-medium'>{userInfo.fullName}</p>
        <button className="text-sm text-slate-700 underline" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
