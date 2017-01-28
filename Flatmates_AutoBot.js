// ==UserScript==
// @name        Flatmates Plus
// @namespace   flatmatesplus
// @include     https://flatmates.com.au/share-houses/sydney/cheapest+males+max-260+private-room+unfurnished
// @require https://raw.github.com/sizzlemctwizzle/GM_config/master/gm_config.js
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_log
// @grant   GM_registerMenuCommand
// @version     1
// @noframes
// @run-at       document-idle
// ==/UserScript==

GM_config.init('Flatmates Plus Options',
{
	'filters':
	{
		'label': 'filters',
		'type': 'text',
		'default': 'blacktown'
	}
});

function opengmcf(){
	GM_config.open();
}

GM_registerMenuCommand('Gumtree Plus Options', opengmcf);



var stream = document.querySelector('div[data-react-class^="ListingResults"]');

function searchProp(id,prop){
  if(stream) {
   var arr = JSON.parse(stream.getAttribute("data-react-props")).listings;
	 var listing = arr.substring(arr.indexOf('"id":' + id));
	 listing = listing.substring(0, arr.indexOf('},{'));
	 if(listing.indexOf(prop) != -1){
		 return true;
	 }
	 else{
		 return false;
	 }
  }
}

function filter(){
var sr = document.getElementById('search-results');
var ads = sr.getElementsByTagName("div");
if(ads){
	for (var i=0; i<ads.length; i++) {
		var id = ads[i].getElementsByClassName('link');
		if(id.length != 0){
			id = id[0].href.toString();
			id = id.substring(id.indexOf('/P')+2);
		  if(searchProp(id,'"internet_connection":"unlimited-internet"') == false){
				ads[i].parentNode.removeChild(ads[i]);
			}
		}
		
		var earlybird = ads[i].getElementsByClassName("home-listing-contact");
		if(earlybird.length != 0){
			if(earlybird[0].innerText.indexOf('Free to Message') == -1){
       ads[i].parentNode.removeChild(ads[i]);
			}
		}
		var title = ads[i].getElementsByClassName("listing-head");
		if(title.length != 0){
			title = title[0].innerText.toString().toLowerCase();
			var filters = GM_config.get('filters');
			if(filters.length != 0){
				filters = filters.split(",");
				for (var i2=0; i2<filters.length; i2++) {
					if(title.indexOf(filters[i2].toLowerCase()) != -1){
						//ads[i].innerHTML = "";
						ads[i].parentNode.removeChild(ads[i]);
					}
				}
			}
		}
	}
}
}

function removeit(id){
	if(document.getElementById(id)){
		document.getElementById(id).parentNode.removeChild(document.getElementById(id));
	}
}

filter();