/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  document.getElementById('user-signed-in').style.display = 'inline';
  // document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  // document.getElementById('user-signed-out').style.display = 'block';
  console.log('Signing out!');
  window.location.replace('.');
  // ui.start('#firebaseui-container', getUiConfig());
};


/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
  if (window.confirm('Are you sure you want to delete your account?')) {
    firebase.auth().currentUser.delete().catch(function(error) {
      if (error.code == 'auth/requires-recent-login') {
        // The user's credential is too old. She needs to sign in again.
        firebase.auth().signOut().then(function() {
          // The timeout allows the message to be displayed after the UI has
          // changed to the signed out state.
          setTimeout(function() {
            alert('Please sign in again to delete your account.');
          }, 1);
        });
      }
    });
  }
};

let initApp = function() {
  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener(
    'click', function() {
      deleteAccount();
    });
  firebase.auth().onAuthStateChanged(function(user) {
    user ? handleSignedInUser(user) : handleSignedOutUser();
  });
};

window.addEventListener('load', initApp);
