window.onload = function() {
  document.getElementById('first_grammar').oninput =
  function() {
    grmr = document.getElementById('first_grammar').value;
    grmr = grmr.replace(/\r/g, '').split('\n');
    prod = {};
    t = [];
    nt = [];

    for (let i = 0; i < grmr.length; i++) {
      grmr[i] = grmr[i].split('->');
      let left = grmr[i][0].trim();
      let right = grmr[i][1].split('|');

      if(prod[left] == undefined) prod[left] = [];

      for (let j = 0; j < right.length; j++) {
        let current = right[j].trim();
        prod[left].push(current);
        for (var k = 0; k < current.length; k++) {
          if(current[k] != '&'){
            if(current[k] != current[k].toLowerCase()){
              if(!nt.includes(current[k])) nt.push(current[k]);
            } else {
              if(!t.includes(current[k])) t.push(current[k]);
            }
          }
        }
      }
    }

    let first = {};
    for (let i = 0; i < t.length; i++) {
      first[t[i]] = [t[i]];
    }
    for (let i = 0; i < nt.length; i++) {
      first[nt[i]] = [];
    }

    let change = false;
    let max = 10;
    do {
      change = false;
      for (let i = 0; i < nt.length; i++) {
        for (let j = 0; j < prod[nt[i]].length; j++) {
          let current = 0;
          do {
            let char = prod[nt[i]][j][current];
            if(char != '&'){
              if(char != char.toLowerCase()){
                for (var k = 0; k < first[char].length; k++) {
                  if(!first[nt[i]].includes(first[char][k])){
                    first[nt[i]].push(first[char][k])
                    change = true;
                  }
                }
                if(prod[char].includes('&')){
                  current++;
                  if(current >= prod[nt[i]][j].length) {
                    if(!first[nt[i]].includes('&')){
                      first[nt[i]].push('&');
                      change = true;
                    }
                    current = -1;
                  }
                } else {
                  current = -1;
                }
              } else {
                if(!first[nt[i]].includes(char)){
                  first[nt[i]].push(char);
                  change = true;
                }
                current = -1
              }
            } else {
              current++;
              if(current >= prod[nt[i]][j].length) {
                if(!first[nt[i]].includes('&')){
                  first[nt[i]].push('&');
                  change = true;
                }
                current = -1;
              }
            }
          } while (current != -1)
        }
      }
    } while (change && max);

    document.getElementById('first_result').innerHTML = '';
    for (let show in first) {
      li = document.createElement('li');
      li.innerText = 'First(' + show + ') = ' + first[show].join(', ');
      document.getElementById('first_result').appendChild(li);
    }
  }

  animationId = [];
  document.getElementById('example_grammar').oninput =
  document.getElementById('example_tokens').oninput =
  function() {
    for (let i = 0; i < animationId.length; i++) {
      window.clearTimeout(animationId[i]);
    }
    document.getElementById('example_results').innerHTML = '';

    let grmr = document.getElementById('example_grammar').value;
    grmr = grmr.replace(/\r/g, '').split('\n');

    let prod = {};
    for (let i = 0; i < grmr.length; i++){
      let current = grmr[i].trim().split('->');

      let left = current[0].trim();
      let right = current[1].split('|');

      if(prod[left] == undefined) prod[left] = [];

      for (let j = 0; j < right.length; j++) {
        let chain = right[j].split(' ');
        for (let k = 0; k < chain.length; k++) {
          chain[k] = chain[k].trim();
        }

        prod[left].push(chain.filter(el => el != ''));
      }
    }

    let tkns = document.getElementById('example_tokens').value;
    tkns = tkns.split(' ');
    for (let i = 0; i < tkns.length; i++) tkns[i] = tkns[i].trim();

    let idx = 0;
    let log = [];
    function nonTerminal(nt, h) {
      log.push({field: 'example_f', value: nt});
      log.push({field: 'example_stack', value: h});
      for (let i = 0; i < prod[nt].length; i++) {
        log.push({field: 'example_prod', value: nt + ' -> ' + prod[nt][i].join(' ')});
        let current = prod[nt][i];
        let ok = true;
        let tree = {node: nt, children: []};
        let returnto = idx;
        for (var j = 0; j < current.length && ok; j++) {
          if(current[j] == current[j].toUpperCase()){
            let tent = match(current[j], h + 1);
            if(tent != false) {
              tree.children.push(tent);
            } else {
              ok = false;
            }
          } else {
            let tent = nonTerminal(current[j], h + 1);
            if(tent != false) {
              tree.children.push(tent);
            } else {
              ok = false;
            }
          }
        }

        if(ok){
          return tree;
        } else {
          idx = returnto;
        }
      }
      return false;
    }

    function match(t, h) {
      if(t == '&') return '';

      log.push({field: 'example_f', value: t});
      log.push({field: 'example_stack', value: h});
      if(tkns[idx] == t) {
        idx++;
        log.push({field: 'example_idx', value: idx});
        log.push({field: 'example_tkn', value: tkns[idx]});
        return {node: t, children: []};
      } else {
        return false;
      }
    }

    document.getElementById('example_idx').innerText = '0';
    document.getElementById('example_tkn').innerText = tkns[0];

    tree = nonTerminal(grmr[0].split('->')[0].trim(), 1);
    function step() {
      if(log.length > 0) {
        let event = log.shift();
        document.getElementById(event.field).innerText = event.value;
        animationId[0] = window.setTimeout(step, document.getElementById('example_spd').value / 10);
      } else {
        function drawTree(id, element) {
          span = document.createElement('span');
          span.innerText = element.node;

          document.getElementById(id).appendChild(span);

          span = document.createElement('span');
          document.getElementById(id).appendChild(span);
          for (let i = 0; i < element.children.length; i++) {
            child = document.createElement('div');
            child.id = id + '-' + i;
            span.appendChild(child);

            animationId.push(window.setTimeout(drawTree, document.getElementById('example_spd').value, id + '-' + i, element.children[i]));
          }
        }

        animationId[0] = window.setTimeout(drawTree, document.getElementById('example_spd').value, 'example_results', tree);
      }
    }

    animationId[0] = window.setTimeout(step, document.getElementById('example_spd').value);
  }

  document.getElementById('example_grammar').oninput();
  document.getElementById('first_grammar').oninput()
}
