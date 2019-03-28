window.onload = function() {
  document.getElementById('regex_body').oninput =
  document.getElementById('regex_flags').oninput =
  document.getElementById('regex_text').oninput =
  function() {
    let pattern = document.getElementById('regex_body').value;
    let flags = document.getElementById('regex_flags').value;

    try {
      let rgx = new RegExp(pattern, flags);
      let value = document.getElementById('regex_text').value;

      html = '';
      while((match = rgx.exec(value)) !== null){
          html += '<li>';
          html += match[0];

          if(match.length > 1) {
            html += ' ('

            for (var i = 1; i < match.length - 1; i++)
              html += match[i] + ', '

            html += match[match.length - 1];
            html += ')';
          }

          html += '</li>';
      }

      document.getElementById('regex_result').innerHTML = html
      document.getElementById('regex_result').className = ''

    } catch(e) {
      document.getElementById('regex_result').innerHTML = '<span> ERRO <br/>' + e.toString() + '</span>'
      document.getElementById('regex_result').className = 'error'
    }
  }

  animationId = null;
  document.getElementById('example_input').oninput =
  document.getElementById('example_tokens').oninput =
  function() {
    window.clearTimeout(animationId);
    document.getElementById('example_results').innerHTML = '';

    let tokens = document.getElementById('example_tokens').value.split('\n');
    let full_regex = '\s*(';

    let H = Math.floor(Math.random() * 360);
    for (var i = 0; i < tokens.length; i++) {
      tokens[i] = tokens[i].replace('\r', '');
      let attridx = tokens[i].indexOf('=');
      tokens[i] = {
        token: tokens[i].substring(0, attridx).trim(),
        regex: tokens[i].substring(attridx + 1).trim(),
        color: 'hsl(' + H + ',' + (70 + Math.floor(Math.random() * 30)) + '%,' + (50 + Math.floor(Math.random() * 25)) + '%)'
      }
      H = (H + 137) % 360;

      full_regex += '(' + tokens[i].regex + ')' + '|';
      tokens[i].regex = '^' + tokens[i].regex + '$';
      tokens[i].regex = new RegExp(tokens[i].regex);
    }
    full_regex += '.)';

    console.log(full_regex)

    var rgx = new RegExp(full_regex, 'g');
    var input = document.getElementById('example_input').value;

    function step() {
      match = rgx.exec(input);

      if(match != null){
        if(match[0].trim() != ''){

          let tkn = document.createElement("span");
          for (var i = 0; i < tokens.length; i++) {
            if(tokens[i].regex.test(match[0])){
              tkn.innerText = tokens[i].token;
              tkn.style.backgroundColor = tokens[i].color;

              let lexem = tokens[i].regex.exec(match[0]);
              document.getElementById('example_marr').innerText = lexem.slice(1).join(', ');
              document.getElementById('example_tkn').innerText = tokens[i].token;

              if(lexem.length > 1){
                tkn.innerText += ', '
                for (var i = 1; i < lexem.length; i++) {
                  if(lexem[i] != undefined)
                    tkn.innerText += lexem[i]
                }
              }

              break;
            }
          }

          if(tkn.innerText == ''){
            tkn.innerText = '?, ' + match[0]
            tkn.style.backgroundColor = "#ccc"
          }

          document.getElementById('example_results').appendChild(tkn);
        }
        let begin = Math.max(rgx.lastIndex - 5, 0);
        let end = Math.max(10 - begin, rgx.lastIndex + 5);

        document.getElementById('example_current').innerHTML = input.substring(begin, rgx.lastIndex) +
                                                              '<span style="color:#c42847;text-decoration:underline;">' +
                                                              (input[rgx.lastIndex] != undefined ? input[rgx.lastIndex] : '') +
                                                              '</span>' + input.substring(rgx.lastIndex + 1, end);

        document.getElementById('example_idx').innerText = rgx.lastIndex;
        document.getElementById('example_m0').innerText = match[0];

        animationId = window.setTimeout(step, document.getElementById('example_spd').value);

      }
    }

    animationId = window.setTimeout(step, document.getElementById('example_spd').value);
  }



  document.getElementById('example_input').oninput()
  document.getElementById('regex_body').oninput()
}
