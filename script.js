
// document.addEventListener('DOMContentLoaded', function() {
(function($) {

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
      if (utmValues.source === 'rehabpath' && utmValues.medium === 'referral' && utmValues.campaign === 'luxuryrehab') {
        Cookie.create('recoveryUTM', JSON.stringify(utmValues), 90)
        Form.insertHiddenFieldValues('#form-field-utm_campaign', utmValues.campaign)
        Links.onLoad()
      }
    }
  },
}

const Form = {
  insertHiddenFieldValues: function(elementQuery = '#form-field-utm_campaign', campaign) {
    const element = document.querySelector(elementQuery)
    if (element && element !== null) {
      element.value = campaign
    }
  }
}

const Links = {
  onLoad: function() {
    $('body a').each(function() {
      const url = $(this).attr('href')
      console.log(url)
      if (url.includes('mailto')) {
        const email = url.replace('mailto:', '')
        $(this).attr('href', Links.addAliasToEmail(email, '+recovery'))
      }
    })
  },
  addAliasToEmail: function (email, alias) {
    console.log(email)
    // Split the email address into local part and domain part
    const parts = email.split('@')
    // Check if the email is in valid format
    if (parts.length !== 2) {
      console.log('Invalid email format.')
      return
    }
    // Insert the alias just before the domain part
    const modifiedEmail = parts[0] + alias + '@' + parts[1]
    return 'mailto:' + modifiedEmail
  },
}

UTM.onLoad()
const cookie_recoveryUTM = Cookie.read('recoveryUTM')
if (cookie_recoveryUTM) {
  const utmValues = JSON.parse(cookie_recoveryUTM)
  Form.insertHiddenFieldValues('#form-field-utm_campaign', utmValues.campaign)
  Links.onLoad()
}
})(jQuery)
// });
