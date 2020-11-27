/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
let handleSignedInUser = function(user) {
  document.getElementById('user-signed-in').style.display = 'inline';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
};


/**
 * Displays the UI for a signed out user.
 */
let handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  window.location.replace('.');
};


/**
 * Deletes the user's account.
 */
let deleteAccount = function() {
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

let addSpan = function() {
  let span = document.createElement('span');
  let inner = '<span id="user-signed-in" class="hidden">';
  inner += '<span id="user-info"><span id="name"></span>';
  inner += '(<span id="email"></span>)<div>';
  inner += '<span><button id="sign-out">Sign Out</button></span>';
  inner += '<span><button id="delete-account">Delete account</button></span>';
  inner += '</div></span></span>';
  span.innerHTML = inner;
  document.body.appendChild(span);
  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener(
    'click', function() {
      deleteAccount();
    });
};

let initApp = function() {
  addSpan();
  firebase.auth().onAuthStateChanged(function(user) {
    user ? handleSignedInUser(user) : handleSignedOutUser();
  });
};

window.addEventListener('load', initApp);
