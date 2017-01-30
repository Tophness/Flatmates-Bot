// ==UserScript==
// @name        Flatmates Plus
// @namespace   flatmatesplus
// @include     https://flatmates.com.au/share-houses/*
// @require https://greasyfork.org/scripts/6217-gm-config/code/GM_config.js?version=23537
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_log
// @grant   GM_registerMenuCommand
// @version     1
// @noframes
// @run-at       document-idle
// ==/UserScript==
GM_config.init('Flatmates Plus Options', {
  'filters':
  {
    'label': 'Location Filters',
    'type': 'text',
    'default': 'blacktown'
  },
  'blacklist':
  {
    'label': 'Descriptions Blacklist',
    'type': 'text',
    'default': ''
  },
  'whitelist':
  {
    'label': 'Descriprions Whitelist',
    'type': 'text',
    'default': 'unlimited-internet'
  },
  'homeaddress':
  {
    'label': 'Work Address (For distance calculating)',
    'type': 'text',
    'default': 'Central Station, Sydney, NSW'
  }
});
function opengmcf() {
  GM_config.open();
}
GM_registerMenuCommand('Flatmates Plus Options', opengmcf);
function findProp(listing, prop, whiteblack, listingel) {
  if (listing.indexOf(prop) != - 1) {
    if (whiteblack == 0) {
      listingel.parentNode.removeChild(listingel);
    }
  } 
  else {
    if (whiteblack == 1) {
      listingel.parentNode.removeChild(listingel);
    }
  }
}
var stream = document.querySelector('div[data-react-class^="ListingResults"]');
function searchProp(id, prop, whiteblack, listingel) {
  if (stream) {
    var arr = JSON.parse(stream.getAttribute('data-react-props')).listings;
    var findid = arr.indexOf('"id":' + id);
    if (findid != - 1) {
      var listing = arr.substring(findid);
      listing = listing.substring(0, arr.indexOf('},{'));
      return findProp(listing, prop, whiteblack, listingel);
    } 
    else {
      ajaxsubmit('https://flatmates.com.au/P' + id, id, prop, whiteblack, listingel);
    }
  }
}
function unescapeHtml(safe) {
  return safe.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, '\'');
} //function unescapeHtml(safe) {
//    return $('<div />').html(safe).text();
//}

function findPropAjax(arr, id, prop, whiteblack, listingel) {
  var findid = arr.indexOf('PropertyListing');
  if (findid != - 1) {
    //var listing = arr.substring(findid);
    //listing = listing.substring(0, arr.indexOf('modal-placeholder'));
    //findProp(listing, prop);
    findProp(unescapeHtml(arr.substring(findid)), prop, whiteblack, listingel);
  }
}
function ajaxsubmit(url, id, prop, whiteblack, listingel)
{
  var mygetrequest = new ajaxRequest();
  mygetrequest.onreadystatechange = function () {
    if (mygetrequest.readyState == 4) {
      if (mygetrequest.status == 200) {
        findPropAjax(mygetrequest.responseText, id, prop, whiteblack, listingel);
      }
    }
  }
  mygetrequest.open('GET', url, true);
  mygetrequest.send(null);
}
function ajaxRequest() {
  var activexmodes = [
    'Msxml2.XMLHTTP',
    'Microsoft.XMLHTTP'
  ];
  if (window.ActiveXObject) {
    for (var i = 0; i < activexmodes.length; i++) {
      try {
        return new ActiveXObject(activexmodes[i]);
      } 
      catch (e) {
      }
    }
  } 
  else if (window.XMLHttpRequest)
  return new XMLHttpRequest();
   else
  return false;
}
var i = 0;
function filter(listingel) {
  i++;
  var id = listingel.getElementsByClassName('link');
  if (id.length != 0) {
    id = id[0].href.toString();
    id = id.substring(id.indexOf('/P') + 2);
    var blacklist = GM_config.get('blacklist');
    if (blacklist.length != 0) {
      blacklist = blacklist.split(',');
      for (var i3 = 0; i3 < blacklist.length; i3++) {
        searchProp(id, blacklist[i3].toLowerCase(), 0, listingel);
      }
    } 
    else {
      var whitelist = GM_config.get('whitelist');
      if (whitelist.length != 0) {
        whitelist = whitelist.split(',');
        for (var i5 = 0; i5 < whitelist.length; i5++) {
          searchProp(id, whitelist[i5].toLowerCase(), 1, listingel);
        }
      }
    }
  }
  var earlybird = listingel.getElementsByClassName('home-listing-contact');
  if (earlybird.length != 0) {
    if (earlybird[0].innerText.indexOf('Free to Message') == - 1) {
      listingel.parentNode.removeChild(listingel);
    }
  }
  var title = listingel.getElementsByClassName('listing-head');
  if (title.length != 0) {
    title = title[0].innerText.toString().toLowerCase();
    var filters = GM_config.get('filters');
    if (filters.length != 0) {
      filters = filters.split(',');
      for (var i2 = 0; i2 < filters.length; i2++) {
        if (title.indexOf(filters[i2].toLowerCase()) != - 1) {
          listingel.parentNode.removeChild(listingel);
        }
      }
    }
    listingel.id = 'listing' + i;
    gdist(listingel.id, title);
  }
}
function gdist(listingel, title) {
  var etitle = document.createElement('div');
  etitle.innerHTML = title;
  etitle.id = 'etitle';
  etitle.style.visibility = 'hidden';
  
  var elistingel = document.createElement('div');
  elistingel.innerHTML = listingel;
  elistingel.id = 'elistingel';
  elistingel.style.visibility = 'hidden';
  
  var ehomeaddress = document.createElement('div');
  ehomeaddress.innerHTML = GM_config.get('homeaddress');
  ehomeaddress.id = 'ehomeaddress';
  ehomeaddress.style.visibility = 'hidden';
  
  document.body.appendChild(etitle);
  document.body.appendChild(elistingel);
  document.body.appendChild(ehomeaddress);

  exec(function () {
    var el = document.getElementById('elistingel').innerHTML.toString();
    var or = document.getElementById('ehomeaddress').innerHTML.toString();
    var des = document.getElementById('etitle').innerHTML.toString();
    var TransitOptions = {
      modes: [
        'TRAIN',
        'BUS'
      ]
    }
    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
      origins: [
        or
      ],
      destinations: [
        des
      ],
      travelMode: 'TRANSIT',
      transitOptions: TransitOptions,
      unitSystem: google.maps.UnitSystem.METRIC
    }, function (response, status) {
      if (status !== 'OK') {
        console.log('Error was: ' + status);
      } else {
        var originList = response.originAddresses;
        var destinationList = response.destinationAddresses;
        for (var i = 0; i < originList.length; i++) {
          var results = response.rows[i].elements;
          for (var j = 0; j < results.length; j++) {
            var newdiv = document.createElement('div');
            newdiv.innerHTML += results[j].duration.text + ' to ' + originList[i] + '<br>';
            document.getElementById(el).appendChild(newdiv);
          }
        }
      }
    });
  });
   document.body.removeChild(etitle);
   document.body.removeChild(elistingel);
   document.body.removeChild(ehomeaddress);
}
function exec(fn) {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.textContent = '(' + fn + ')();';
  document.body.appendChild(script); // run the script
  document.body.removeChild(script); // clean up
}
function removeit(id) {
  if (document.getElementById(id)) {
    document.getElementById(id).parentNode.removeChild(document.getElementById(id));
  }
}
function timefilter(listingel) {
  setTimeout(function () {
    filter(listingel[0]);
  }, 200);
}
waitForKeyElements('div.content-column', timefilter);
function waitForKeyElements(selectorTxt, /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
bWaitOnce, /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
iframeSelector /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
  var targetNodes,
  btargetsFound;
  if (typeof iframeSelector == 'undefined')
  targetNodes = $(selectorTxt);
   else
  targetNodes = $(iframeSelector).contents().find(selectorTxt);
  if (targetNodes && targetNodes.length > 0) {
    btargetsFound = true;
    /*--- Found target node(s).  Go through each and act if they
            are new.
        */
    targetNodes.each(function () {
      var jThis = $(this);
      var alreadyFound = jThis.data('alreadyFound') || false;
      if (!alreadyFound) {
        //--- Call the payload function.
        var cancelFound = actionFunction(jThis);
        if (cancelFound)
        btargetsFound = false;
         else
        jThis.data('alreadyFound', true);
      }
    });
  } 
  else {
    btargetsFound = false;
  } //--- Get the timer-control variable for this selector.

  var controlObj = waitForKeyElements.controlObj || {
  };
  var controlKey = selectorTxt.replace(/[^\w]/g, '_');
  var timeControl = controlObj[controlKey];
  //--- Now set or clear the timer as appropriate.
  if (btargetsFound && bWaitOnce && timeControl) {
    //--- The only condition where we need to clear the timer.
    clearInterval(timeControl);
    delete controlObj[controlKey]
  } 
  else {
    //--- Set a timer, if needed.
    if (!timeControl) {
      timeControl = setInterval(function () {
        waitForKeyElements(selectorTxt, actionFunction, bWaitOnce, iframeSelector
        );
      }, 300
      );
      controlObj[controlKey] = timeControl;
    }
  }
  waitForKeyElements.controlObj = controlObj;
}
