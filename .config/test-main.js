const allTestFiles = [];
const TEST_REGEXP = /(spec|test)\.js$/i;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 200;
function Spy(name) {
	this.spy = jasmine.createSpy(name?name:'dummy');
	return this.spy;
}
function changeInputValue(inputNode, value) {
	inputNode.value = value;
	inputNode.dispatchEvent(new Event('input', {target: inputNode, bubbles: true}));
	inputNode.dispatchEvent(new Event('change', {target: inputNode, bubbles: true}));
}
// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    const normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule)
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
