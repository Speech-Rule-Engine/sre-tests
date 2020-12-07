let ui = new firebaseui.auth.AuthUI(firebase.auth());

let update = async function(authResult) {
  let div = document.createElement('div');
  div.textContent = 'Updating...';
  document.body.appendChild(div);
  await Fireup.update(firebase.firestore(), 'tests', authResult.user.uid, 'nemeth');
  window.location.assign('selection.html');
};

let uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      update(authResult);
      return false;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInSuccessUrl: 'brf2nemeth.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: 'privacy.html',
  // Privacy policy url.
  privacyPolicyUrl: 'privacy.html'
};

ui.start('#firebaseui-auth-container', uiConfig);
