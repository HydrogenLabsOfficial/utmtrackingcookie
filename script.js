
// document.addEventListener('DOMContentLoaded', function() {
(function($) {

const Variables = {
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
    '+41583605500':'+1111111111',
    '41763041558':'1111111111'
  },
}

const Cookie = {
  read: function(name) {
    var nameEQ = name + "="
    var ca = document.cookie.split(';')
    for(var i=0;i < ca.length;i++) {
        var c = ca[i]
        while (c.charAt(0)==' ') c = c.substring(1,c.length)
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length)
    }
    return null
  },
  create: function(name, value, days) {
    let expires = ""
    if (days) {
      var date = new Date()
      date.setTime(date.getTime()+(days*24*60*60*1000))
      expires = "; expires="+date.toGMTString()
    } else {
      expires = ""
    }
    document.cookie = name + "=" + value + expires + "; path=/"
  },
  erase: function(name) {
    Cookie.create(name, "", -1)
  },
}

const UTM = {
  onLoad: function() {
    // Function to check if URL contains UTM parameters
    const urlParams = new URLSearchParams(window.location.search)
    // Check if all UTM parameters are present
    const utmValues = {
      'source': urlParams.get('utm_source'),
      'medium': urlParams.get('utm_medium'),
      'campaign': urlParams.get('utm_campaign'),
    }
    if (utmValues.source && utmValues.medium && utmValues.campaign) {
      // console.log('Source: ' + utmValues.source, 'Medium: ' + utmValues.medium, 'Campaign: ', utmValues.campaign)
      if (utmValues.source === Variables.utm.source && utmValues.medium === Variables.utm.medium && utmValues.campaign === Variables.utm.campaign) {
        Cookie.create(Variables.cookieName, JSON.stringify(utmValues), 90)
        Form.insertHiddenFieldValues(Variables.hiddenFormField, utmValues.campaign)
        Links.onLoad()
      }
    }
  },
}

const Form = {
  insertHiddenFieldValues: function(elementQuery = '', campaign = '') {
    const element = document.querySelector(elementQuery)
    if (element && element !== null) {
      element.value = campaign
    }
  }
}

const Links = {
  onLoad: function() {
    if (!Variables.emailAlias && !Variables.phoneNumbersToReplace) {
      return
    }
    document.querySelectorAll('body a').forEach(function(element) {
      const href = element.getAttribute('href')
      if (Variables.emailAlias) {
        if (href.includes('mailto')) {
          const email = href.replace('mailto:', '')
          const modifiedEmail = addAliasToEmail(email, Variables.emailAlias)
          element.setAttribute('href', modifiedEmail)
        }
      }

      if (!Variables.phoneNumbersToReplace) {
        return;
      }
      if (href.startsWith('tel:')) {
        const tel = href.replace('tel:', '')
        const phoneNumberToReplace = Variables.phoneNumbersToReplace[tel]
        if (phoneNumberToReplace) {
          element.setAttribute('href', 'tel:'+phoneNumberToReplace)
          element.innerHTML = phoneNumberToReplace
        }
      }
      
      for (const key in Variables.phoneNumbersToReplace) {
        if (Object.hasOwnProperty.call(Variables.phoneNumbersToReplace, key)) {
          const phoneNumberToReplace = Variables.phoneNumbersToReplace[key];
          if (href.startsWith('https://wa.me/'+key)) {
            const whatsappUrl = new URL(href);
            whatsappUrl.searchParams.set('text', 'Message I was referred by '+Variables.utm.campaign);
            whatsappUrl.pathname = phoneNumberToReplace
            element.setAttribute('href', whatsappUrl.href)
            element.innerHTML = phoneNumberToReplace
          }
        }
      }
    })
  },
  addAliasToEmail: function (email, alias) {
    // Split the email address into local part and domain part
    const parts = email.split('@')
    // Check if the email is in valid format
    if (parts.length !== 2) {
      console.error('Invalid email format.')
      return
    }
    // Insert the alias just before the domain part
    const modifiedEmail = parts[0] + alias + '@' + parts[1]
    return 'mailto:' + modifiedEmail
  }
}

UTM.onLoad()
const cookie_recoveryUTM = Cookie.read(cookieName)
if (cookie_recoveryUTM) {
  const utmValues = JSON.parse(cookie_recoveryUTM)
  if (utmValues.campaign) {
    Form.insertHiddenFieldValues(Variables.hiddenFormField, utmValues.campaign)
    Links.onLoad()
  }
}
})(jQuery)
// });
