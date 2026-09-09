    throw new Error('Enter username and password');
  }

  await setPersistence(auth, browserLocalPersistence);

  const cred = await signInWithEmailAndPassword(
    auth,
    toAuthEmail(username),
    password
  );

  const profile = await loadProfile(cred.user.uid);
  if (!profile) throw new Error('Profile not found');
  return profile;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const changeLoginUsername = async (
  uid: string,
  oldUsername: string,
  newUsername: string
): Promise<void> => {
  const userErr = validateUsername(newUsername);
  if (userErr) throw new Error(userErr);

  const oldKey = normalizeUsername(oldUsername);
  const newKey = normalizeUsername(newUsername);

  if (oldKey === newKey) {
    await update(ref(rtdb, `users/${uid}`), {
      username: newUsername.trim(),
      lastProfileUpdate: Date.now(),
    });
    return;
  }

  const taken = await get(ref(rtdb, `usernames/${newKey}`));
  if (taken.exists() && taken.val() !== uid) {
    throw new Error('Username already taken');
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Not logged in');
  }

  await updateEmail(auth.currentUser, toAuthEmail(newUsername));
  await remove(ref(rtdb, `usernames/${oldKey}`));
  await set(ref(rtdb, `usernames/${newKey}`), uid);
  await update(ref(rtdb, `users/${uid}`), {
    username: newUsername.trim(),
    lastProfileUpdate: Date.now(),
  });
};
