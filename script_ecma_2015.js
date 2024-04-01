var Variables = {
  // UTM values to match
  utm: {
    source: 'rehabpath',
    medium: 'referral',
    campaign: 'luxuryrehab',
  },
  // Cookie name to check
  cookieName: 'recoveryUTM',
  // Hidden Form field
  hiddenFormField: '#form-field-utm_campaign',
  // Email alias to append
  emailAlias: '+recovery',

  phoneNumbersToReplace: {
    '+12312312345': '+1111111111',
    '12312312345': '1111111111'
  },
};

var Cookie = {
  read: function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  create: function(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  },
  erase: function(name) {
    this.create(name, "", -1);
  },
};

var UTM = {
  onLoad: function() {
    // Function to check if URL contains UTM parameters
    var urlParams = new URLSearchParams(window.location.search);
    // Check if all UTM parameters are present
    var utmValues = {
      'source': urlParams.get('utm_source'),
      'medium': urlParams.get('utm_medium'),
      'campaign': urlParams.get('utm_campaign'),
    };
    if (utmValues.source && utmValues.medium && utmValues.campaign) {
      // console.log('Source: ' + utmValues.source, 'Medium: ' + utmValues.medium, 'Campaign: ', utmValues.campaign)
      if (utmValues.source === Variables.utm.source && utmValues.medium === Variables.utm.medium && utmValues.campaign === Variables.utm.campaign) {
        Cookie.create(Variables.cookieName, JSON.stringify(utmValues), 90);
        Form.insertHiddenFieldValues(Variables.hiddenFormField, utmValues.campaign);
        Links.onLoad();
      }
    }
  },
};

var Form = {
  insertHiddenFieldValues: function(elementQuery, campaign) {
    var element = document.querySelector(elementQuery);
    if (element && element !== null) {
      element.value = campaign;
    }
  }
};

var Links = {
  onLoad: function() {
    if (!Variables.emailAlias && !Variables.phoneNumbersToReplace) {
      return;
    }
    document.querySelectorAll('body a').forEach(function(element) {
      var href = element.getAttribute('href');
      if (Variables.emailAlias) {
        if (href.includes('mailto') && !href.includes(Variables.emailAlias)) {
          var email = href.replace('mailto:', '');
          var modifiedEmail = Links.addAliasToEmail(email, Variables.emailAlias);
          element.setAttribute('href', modifiedEmail);
        }
      }
      if (!Variables.phoneNumbersToReplace) {
        return;
      }
      if (href.startsWith('tel:')) {
        var tel = href.replace('tel:', '');
        var phoneNumberToReplace = Variables.phoneNumbersToReplace[tel];
        if (phoneNumberToReplace) {
          element.setAttribute('href', 'tel:' + phoneNumberToReplace);
          element.innerHTML = phoneNumberToReplace;
        }
      }

      for (var key in Variables.phoneNumbersToReplace) {
        if (Object.hasOwnProperty.call(Variables.phoneNumbersToReplace, key)) {
          var phoneNumberToReplace = Variables.phoneNumbersToReplace[key];
          if (href.startsWith('https://wa.me/' + key)) {
            var whatsappUrl = new URL(href);
            whatsappUrl.searchParams.set('text', 'Message I was referred by ' + Variables.utm.campaign);
            whatsappUrl.pathname = phoneNumberToReplace;
            element.setAttribute('href', whatsappUrl.href);
            element.innerHTML = phoneNumberToReplace;
          }
        }
      }
    });
  },
  addAliasToEmail: function(email, alias) {
    // Split the email address into local part and domain part
    var parts = email.split('@');
    // Check if the email is in valid format
    if (parts.length !== 2) {
      console.error('Invalid email format.');
      return;
    }
    // Insert the alias just before the domain part
    var modifiedEmail = parts[0] + alias + '@' + parts[1];
    return 'mailto:' + modifiedEmail;
  }
};

document.addEventListener('readystatechange', function() {
  if (document.readyState === 'complete') {
    UTM.onLoad();
    var cookie_recoveryUTM = Cookie.read(Variables.cookieName);
    if (cookie_recoveryUTM) {
      var utmValues = JSON.parse(cookie_recoveryUTM);
      if (utmValues.campaign) {
        Form.insertHiddenFieldValues(Variables.hiddenFormField, utmValues.campaign);
        Links.onLoad();
      }
    }
  }
}, false);
