// taken from identica badge: http://identi.ca/js/identica-badge.js
function createHTMLElement(tagName) {
   if(document.createElementNS)
      var elem = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
   else
      var elem = document.createElement(tagName);

   return elem;
}

// taken from identica badge: http://identi.ca/js/identica-badge.js
function isNumeric(value) {
  if (value == null || !value.toString().match(/^[-]?\d*\.?\d*$/)) return false;
  return true;
}

// taken from identica badge: http://identi.ca/js/identica-badge.js
function markupPost(raw, server) {
  var start = 0; var p = createHTMLElement('p');

  raw.replace(/((http|https):\/\/|\!|@|#)(([\w_]+)?[^\s]*)/g,
    function(sub, type, scheme, url, word, offset, full)
    {
      if(!scheme && !word) return; // just punctuation
      var label = ''; var href = '';
      var pretext = full.substr(start, offset - start);

      moniker = word.split('_'); // behaviour with underscores differs
      if(type == '#') moniker = moniker.join('');
      else word = moniker = moniker[0].toLowerCase();

      switch(type) {
        case 'http://': case 'https://': // html links
          href = scheme + '://' + url; break;
        case '@': // link users
          href = 'http://' + server + '/' + moniker; break;
        case '!': // link groups
          href = 'http://' + server + '/group/' + moniker; break;
        case '#': // link tags
          href = 'http://' + server + '/tag/' + moniker; break;
        default: // bad call (just reset position for text)
          start = offset;
      }
      if(scheme) { // only urls will have scheme
        label = sub; start = offset + sub.length;
      } else {
        label = word; pretext += type;
        start = offset + word.length + type.length;
      }
      p.appendChild(document.createTextNode(pretext));

      var link = createHTMLElement('a');
      link.appendChild(document.createTextNode(label));
      link.href = href; link.target = '_statusnet';
      p.appendChild(link);
    });

  if(start != raw.length) {
    endtext = raw.substr(start);
    p.appendChild(document.createTextNode(endtext));
  }
  return p;
}

function formatIdenticaDate(item) {
  return "<a class='identica-post-date' href='" + item.id + "'>" + item.created_at + "</a>"
}

function insertIdenticaPosts(data) {
  (function($) {
    $('.identica').each(function() {
      $(this).prepend("<div class='identica-title'>" + $(this).attr("data-username") + " - identi.ca </div>");
      $(this).append("<div class='identica-container'></div>");
      var target = '.' + $(this).attr('class') + ' .identica-container';
      var limit = parseInt($(this).attr("data-limit"));
      if (isNaN(limit)) {
        limit = 5;
      }

      for (var i = 0; i < data.length && i < limit; i++) {
        $('<div class="identica-post">' + markupPost(data[i].text , "identi.ca").innerHTML + ' ' + formatIdenticaDate(data[i]) + "</div>").appendTo(target);
      }
    });
  })(jQuery);
}

(function($) {
  $('.identica').each(function() {
    var username = $(this).attr("data-username");
    $('body').append("<script type='text/javascript' src='http://identi.ca/api/statuses/user_timeline/" + username + ".json?callback=insertIdenticaPosts'></script>")
  });
})(jQuery);

