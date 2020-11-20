let Convert = {};

Convert.bldtMap = new Map();
Convert.nabtMap = new Map();
Convert.map = null;
Convert.content = '';



Convert.init = function() {
  let BLDT = ' a1b\'k2l`cif/msp"e3h9o6r~djg>ntq,*5<-u8v.%{$+x!&;:4|0z7(_?w}#y)=';
  let count = 0;
  for (let str of BLDT.split('')) {
    Convert.bldtMap.set(str, String.fromCodePoint(0x2800 + count++));
  }
  let NABT = ' A1B\'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=';
  count = 0;
  for (let str of NABT.split('')) {
    Convert.nabtMap.set(str, String.fromCodePoint(0x2800 + count++));
  }
  Convert.map = Convert.bldtMap;
  Convert.field = {
    ip: document.getElementById('input'),
    out: document.getElementById('braille'),
    error: document.getElementById('error'),
    format: document.getElementById('format'),
    expression: document.getElementById('mathexpression'),
    name: document.getElementById('mathname')
  };
  document.querySelector('.btn.next').addEventListener('click', () => {
    console.log('Next');
    Convert.cycleTests(true);
  });
  document.querySelector('.btn.prev').addEventListener('click', () => {
    console.log('Previous');
    Convert.cycleTests(false);
  });
  Convert.prepareTests();
  Convert.setTest(Convert.currentTest());
};

Convert.changeFormat = function(a) {
  Convert.map = Convert.field.format.value === 'nabt' ?
    Convert.nabtMap : Convert.bldtMap;
};

Convert.translate = function(str) {
  Convert.field.error.innerHTML = '';
  let newStr = '';
  let result = '';
  for (let char of str.split('')) {
    let res = Convert.map.get(char);
    if (res) {
      newStr += char;
      result += res;
    } else {
      Convert.field.error.innerHTML = 'Unknown element ' + char;
    }
  }
  return [newStr, result];
};

Convert.generate = function() {
  if (Convert.current === Convert.field.ip.value) return;
  let cursor = Convert.field.ip.selectionStart;
  let length = Convert.field.ip.value.length;
  Convert.field.out.innerHTML = '';
  let [input, output] = Convert.translate(Convert.field.ip.value);
  Convert.field.ip.value = input;
  Convert.current = input;
  Convert.field.out.innerHTML = output;
  Convert.field.ip.selectionEnd = cursor - (length - output.length);
};

Convert.generatem = function() {
  setTimeout(Convert.generate, 100);
};


// This is a placeholder for the actual test object.
Convert.tests = {
  "Quadratic": {"tex": "x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"},
  "Cauchy Schwarz": {"tex": "\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq  \\left( \\sum_{k=1}^n a_k^2 \\right)  \\left( \\sum_{k=1}^n b_k^2 \\right)"},
  "Continued Fraction": {"tex": "\\frac{1}{\\Bigl(\\sqrt{\\phi\\sqrt{5}}-\\phi\\Bigr)  e^{\\frac25\\pi}} =    1+\\frac{e^{-2\\pi}}      {1+\\frac{e^{-4\\pi}}        {1+\\frac{e^{-6\\pi}}          {1+\\frac{e^{-8\\pi}}            {1+\\ldots} } } }"},
  "Basel Problem": {"tex": "\\sum_{n=1}^\\infty {1\\over n^2} = {\\pi^2\\over 6}"},
  "Cauchy's Integral Formula": {"tex": "f(a) = \\oint_\\gamma \\frac{f(z)}{z-a}dz"},
  "Standard Deviation": {"tex": "\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^N {(x_i-\\mu)}^2}"}
};
Convert.countTests = 0;
Convert.preparedTests = [];

Convert.currentTest = function() {
  return Convert.preparedTests[Convert.countTests];
};

Convert.prepareTests = function() {
  for (let [name, test] of Object.entries(Convert.tests)) {
    test.name = name;
    test.brf = '';
    test.unicode = '';
    Convert.preparedTests.push(test);
  }
};

Convert.nextTest = function(direction) {
  Convert.countTests = Convert.countTests + (direction ? 1 : -1);
  if (Convert.countTests < 0) {
    Convert.countTests = Convert.preparedTests.length - 1;
  }
  if (Convert.countTests >= Convert.preparedTests.length) {
    Convert.countTests = 0;
  }
  return Convert.currentTest();
};

Convert.saveTest = function() {
  let test = Convert.currentTest();
  test.brf = Convert.field.ip.value;
  test.unicode = Convert.field.out.innerHTML;
};

Convert.cycleTests = function(direction) {
  Convert.saveTest();
  Convert.setTest(Convert.nextTest(direction));
};


Convert.setTest = function(test) {
  Convert.field.name.innerHTML = test.name;
  Convert.field.expression.innerHTML = `\\[${test.tex}\\]`;
  Convert.field.out.innerHTML = test.unicode;
  Convert.field.ip.value = test.brf;
  MathJax.typeset();
};
