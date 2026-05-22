'use client';
import axios from 'axios';
import React, { useEffect } from 'react';
import { UserDetailContext } from '../contexts/userDetailContext';

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [userDetail, setUserDetail] = React.useState(null);
  const createNewUser = async () => {
    const user = await axios.post('/api/users', {});
    console.log('User created:', user.data);
    setUserDetail(user.data);
  };
  useEffect(() => {
    createNewUser();
  }, []);

  return (
    <div>
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        {children}
      </UserDetailContext.Provider>
    </div>
  );
};

export default Provider;
