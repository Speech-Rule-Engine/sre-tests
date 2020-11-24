var ui = new firebaseui.auth.AuthUI(firebase.auth());

let auth = function() {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('Signed in: ' + user);
      // Signed in 
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
    })};

var uiConfig = {
  callbacks: {
    // signInSuccessWithAuthResult: function(authResult) {
    //   // User successfully signed in.
    //   // Return type determines whether we continue the redirect automatically
    //   // or whether we leave that to developer to handle.
    //   console.log('Signed in: ');
    //   console.log(authResult);
    //   return 'brf2nemeth.html';
    // },
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
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};

ui.start('#firebaseui-auth-container', uiConfig);
