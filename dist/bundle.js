/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/script.js":
/*!**************************!*\
  !*** ./src/js/script.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _sass_main_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../sass/main.scss */ \"./src/sass/main.scss\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _regeneratorRuntime() { \"use strict\"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = \"function\" == typeof Symbol ? Symbol : {}, a = i.iterator || \"@@iterator\", c = i.asyncIterator || \"@@asyncIterator\", u = i.toStringTag || \"@@toStringTag\"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, \"\"); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, \"_invoke\", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: \"normal\", arg: t.call(e, r) }; } catch (t) { return { type: \"throw\", arg: t }; } } e.wrap = wrap; var h = \"suspendedStart\", l = \"suspendedYield\", f = \"executing\", s = \"completed\", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { [\"next\", \"throw\", \"return\"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if (\"throw\" !== c.type) { var u = c.arg, h = u.value; return h && \"object\" == _typeof(h) && n.call(h, \"__await\") ? e.resolve(h.__await).then(function (t) { invoke(\"next\", t, i, a); }, function (t) { invoke(\"throw\", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke(\"throw\", t, i, a); }); } a(c.arg); } var r; o(this, \"_invoke\", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error(\"Generator is already running\"); if (o === s) { if (\"throw\" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if (\"next\" === n.method) n.sent = n._sent = n.arg;else if (\"throw\" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else \"return\" === n.method && n.abrupt(\"return\", n.arg); o = f; var p = tryCatch(e, r, n); if (\"normal\" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } \"throw\" === p.type && (o = s, n.method = \"throw\", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, \"throw\" === n && e.iterator[\"return\"] && (r.method = \"return\", r.arg = t, maybeInvokeDelegate(e, r), \"throw\" === r.method) || \"return\" !== n && (r.method = \"throw\", r.arg = new TypeError(\"The iterator does not provide a '\" + n + \"' method\")), y; var i = tryCatch(o, e.iterator, r.arg); if (\"throw\" === i.type) return r.method = \"throw\", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, \"return\" !== r.method && (r.method = \"next\", r.arg = t), r.delegate = null, y) : a : (r.method = \"throw\", r.arg = new TypeError(\"iterator result is not an object\"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = \"normal\", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: \"root\" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || \"\" === e) { var r = e[a]; if (r) return r.call(e); if (\"function\" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + \" is not iterable\"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, \"constructor\", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, \"constructor\", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, \"GeneratorFunction\"), e.isGeneratorFunction = function (t) { var e = \"function\" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || \"GeneratorFunction\" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, \"GeneratorFunction\")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, \"Generator\"), define(g, a, function () { return this; }), define(g, \"toString\", function () { return \"[object Generator]\"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = \"next\", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) \"t\" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if (\"throw\" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = \"throw\", a.arg = e, r.next = n, o && (r.method = \"next\", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if (\"root\" === i.tryLoc) return handle(\"end\"); if (i.tryLoc <= this.prev) { var c = n.call(i, \"catchLoc\"), u = n.call(i, \"finallyLoc\"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error(\"try statement without catch or finally\"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, \"finallyLoc\") && this.prev < o.finallyLoc) { var i = o; break; } } i && (\"break\" === t || \"continue\" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = \"next\", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if (\"throw\" === t.type) throw t.arg; return \"break\" === t.type || \"continue\" === t.type ? this.next = t.arg : \"return\" === t.type ? (this.rval = this.arg = t.arg, this.method = \"return\", this.next = \"end\") : \"normal\" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, \"catch\": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if (\"throw\" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error(\"illegal catch attempt\"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, \"next\" === this.method && (this.arg = t), y; } }, e; }\nfunction asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }\nfunction _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"next\", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"throw\", n); } _next(void 0); }); }; }\n\ndocument.addEventListener('DOMContentLoaded', function () {\n  var recordButton = document.getElementById('record-note');\n  var uploadButton = document.getElementById('upload-note');\n  var transcriptBox = document.getElementById('transcriptBox');\n  var mediaRecorder;\n  var audioChunks = [];\n  var button = document.getElementById('timer-button');\n  var isRunning = false;\n  var timerInterval;\n  var startTime;\n\n  // Check if the browser supports the MediaRecorder API\n  if (typeof MediaRecorder === \"undefined\") {\n    alert(\"Your browser does not support the MediaRecorder API. Try updating or switching your browser.\");\n    return;\n  }\n  function startRecording() {\n    return _startRecording.apply(this, arguments);\n  }\n  function _startRecording() {\n    _startRecording = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {\n      var stream;\n      return _regeneratorRuntime().wrap(function _callee2$(_context2) {\n        while (1) switch (_context2.prev = _context2.next) {\n          case 0:\n            audioChunks = [];\n            _context2.next = 3;\n            return navigator.mediaDevices.getUserMedia({\n              audio: true\n            });\n          case 3:\n            stream = _context2.sent;\n            mediaRecorder = new MediaRecorder(stream);\n            mediaRecorder.ondataavailable = function (event) {\n              audioChunks.push(event.data);\n            };\n            mediaRecorder.onstop = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {\n              var selectedContactsStr, audioBlob, formData;\n              return _regeneratorRuntime().wrap(function _callee$(_context) {\n                while (1) switch (_context.prev = _context.next) {\n                  case 0:\n                    selectedContactsStr = Array.from(document.querySelectorAll('input[type=\"checkbox\"]:checked')).map(function (input) {\n                      return \"[[\".concat(input.value, \"]]\");\n                    }).join(', ');\n                    console.log(\"Recorded voice !\");\n                    audioBlob = new Blob(audioChunks, {\n                      type: 'audio/mpeg-3'\n                    }); // Ensure the MIME type matches your file format\n                    formData = new FormData();\n                    formData.append('audioFile', audioBlob, 'audio.mp3'); // 'audioFile' matches the name expected by Multer in your backend\n                    formData.append('contacts', selectedContactsStr);\n                    fetch('/transcribe', {\n                      method: 'POST',\n                      body: formData\n                    }).then(function (response) {\n                      return response.json();\n                    }).then(function (data) {\n                      var transcription = data.transcription;\n                      transcriptBox.value = transcription;\n                      recordButton.innerHTML = 'Record';\n                      // Use the transcription and content as needed\n                    })[\"catch\"](function (error) {\n                      return console.error('Error:', error);\n                    });\n                  case 7:\n                  case \"end\":\n                    return _context.stop();\n                }\n              }, _callee);\n            }));\n            mediaRecorder.start();\n          case 8:\n          case \"end\":\n            return _context2.stop();\n        }\n      }, _callee2);\n    }));\n    return _startRecording.apply(this, arguments);\n  }\n  function stopRecording() {\n    mediaRecorder.stop();\n  }\n  var isRecording = false;\n  recordButton.addEventListener('click', function () {\n    if (!isRunning && recordButton.innerHTML != 'Record') {\n      startRecording();\n\n      // Start the timer\n      isRunning = true;\n      startTime = Date.now();\n      recordButton.innerHTML = '0:00'; // Reset display text\n\n      // Update the button every second\n      timerInterval = setInterval(function () {\n        var elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calculate seconds\n        c = '';\n        if (elapsedTime % 60 < 10) {\n          c = '0';\n        }\n        recordButton.innerHTML = \"\".concat(Math.floor(elapsedTime / 60), \":\").concat(c).concat(elapsedTime % 60);\n      }, 1000);\n    } else {\n      stopRecording();\n      // Stop the timer\n      isRunning = false;\n      clearInterval(timerInterval);\n      recordButton.innerHTML = 'Transcribing...'; // Reset button text after stop\n    }\n  });\n  var searchBox = document.getElementById('search-box');\n  var allContacts = []; // Store all contacts\n\n  function fetchContacts() {\n    fetch('/contacts').then(function (response) {\n      return response.json();\n    }).then(function (data) {\n      allContacts = data; // Store the fetched data\n      displayContacts(data); // Display all contacts initially\n      return fetch('/api/mentions/ordered-contacts');\n    }).then(function (response) {\n      return response.json();\n    }).then(function (orderContacts) {\n      orderContacts = orderContacts.map(function (a) {\n        return a.name;\n      });\n      allContacts = allContacts.sort(function (a, b) {\n        // Compare the index of contact names in the orderedNames array\n\n        return orderContacts.indexOf(a.name) - orderContacts.indexOf(b.name);\n      });\n      fuse = new Fuse(allContacts, options);\n      displayContacts(allContacts);\n    })[\"catch\"](function (error) {\n      console.error('Error fetching contacts:', error);\n    });\n  }\n\n  // Keep information about the contacts selected, so that when I filter them it doesnt go away.\n  var selectedContacts = {};\n  function displayContacts(contacts) {\n    var container = document.getElementById('checkbox-list');\n    container.innerHTML = ''; // Clear existing content\n    contacts.forEach(function (contact, index) {\n      var label = document.createElement('label');\n      label.className = 'card';\n      label.innerHTML = \"\\n            <input class=\\\"card__input\\\" type=\\\"checkbox\\\" name=\\\"option\".concat(index + 1, \"\\\" value=\\\"\").concat(contact.name, \"\\\" id=\\\"contact-\").concat(contact.name, \"\\\" \").concat(selectedContacts[contact.name] ? 'checked' : '', \"/>\\n            <div class=\\\"card__body\\\">\\n                <header class=\\\"card__body-header\\\">\\n                    <h2 class=\\\"card__body-header-title\\\">\").concat(contact.name, \"</h2>\\n                    <p class=\\\"card__body-header-subtitle\\\">\").concat(contact.name, \"</p>\\n                </header>\\n                <div class=\\\"card__body-cover\\\"><img class=\\\"card__body-cover-image\\\" src=\\\"\").concat(contact.picture ? contact.picture : '/contacts/pictures/default.png', \"\\\"/>\\n                    <span class=\\\"card__body-cover-checkbox\\\"> \\n                        <svg class=\\\"card__body-cover-checkbox--svg\\\" viewBox=\\\"0 0 12 10\\\">\\n                            <polyline points=\\\"1.5 6 4.5 9 10.5 1\\\"></polyline>\\n                        </svg>\\n                    </span>\\n                </div>\\n            </div>\\n        \");\n      var input = label.querySelector('input');\n      input.addEventListener('change', function () {\n        if (input.checked) {\n          selectedContacts[contact.name] = true;\n        } else {\n          delete selectedContacts[contact.name];\n        }\n        updateTags();\n      });\n      container.appendChild(label);\n    });\n  }\n  // Returns the first contact of the list of contacts, taking into account the search (if M is written, its the first element starting with M...)\n  function getFirstContactInList() {\n    var container = document.getElementById('checkbox-list');\n    return container.firstChild;\n  }\n\n  // To have the nice contacts selected in the search bar :)\n\n  var tag_list = document.getElementById(\"tag-list\");\n  var input_tag = tag_list.querySelector(\"input\");\n\n  // Variables to keep track of selected tag for deletion\n  var lastTagSelected = false;\n\n  // Event listener for keyup events in the input field\n  input_tag.addEventListener(\"keyup\", function (e) {\n    if (e.key === 'Enter') {\n      addTagToSearch(getFirstContactInList().querySelector('input'));\n    } else if (e.key === 'Backspace') {\n      handleBackspace();\n    } else {\n      lastTagSelected = false; // Reset if other keys are pressed\n    }\n  });\n\n  // Function to handle the addition of tags\n  function addTagToSearch(element) {\n    element.checked = true;\n    var event = new Event('change', {\n      bubbles: true,\n      cancelable: true\n    });\n    element.dispatchEvent(event);\n    updateTags();\n    input_tag.value = '';\n    filterContacts();\n    searchBox.focus();\n  }\n\n  // Function to handle backspace key\n  function handleBackspace() {\n    if (input_tag.value === '' && !lastTagSelected) {\n      selectLastTag();\n    } else if (input_tag.value === '' && lastTagSelected) {\n      deleteLastTag();\n    }\n  }\n\n  // Function to select the last tag\n  function selectLastTag() {\n    var tagItems = tag_list.querySelectorAll('li:not(:last-child)');\n    if (tagItems.length > 0) {\n      var lastTag = tagItems[tagItems.length - 1];\n      lastTag.classList.add('selected-tag');\n      lastTagSelected = true;\n    }\n  }\n\n  // Function to delete the last tag\n  function deleteLastTag() {\n    var tagItems = tag_list.querySelectorAll('li:not(:last-child)');\n    if (tagItems.length > 0) {\n      var lastTag = tagItems[tagItems.length - 1];\n      var contactName = lastTag.textContent.trim();\n      removeTag(contactName);\n      lastTagSelected = false;\n    }\n  }\n\n  // Updates the UI of the tags when an element is added to the selectedContacts\n  function updateTags() {\n    var tagItems = tag_list.querySelectorAll('li:not(:last-child)');\n    tagItems.forEach(function (tag) {\n      return tag.remove();\n    });\n    var liTag = '';\n    Object.keys(selectedContacts).forEach(function (contactName) {\n      liTag += \"<li>\".concat(contactName, \" <i class=\\\"fa fa-times \\\"></i></li>\");\n    });\n    tag_list.insertAdjacentHTML('afterbegin', liTag);\n    var deleteIcons = tag_list.querySelectorAll('.fa-times');\n    deleteIcons.forEach(function (icon) {\n      var contactName = icon.parentElement.textContent.trim();\n      icon.addEventListener('click', function () {\n        return removeTag(contactName);\n      });\n    });\n  }\n\n  // Removes a tag from the search\n  function removeTag(tag) {\n    var element = document.getElementById(\"contact-\".concat(tag));\n    element.checked = false;\n    var event = new Event('change', {\n      bubbles: true,\n      cancelable: true\n    });\n    element.dispatchEvent(event);\n    delete selectedContacts[tag];\n    updateTags();\n    searchBox.focus();\n  }\n\n  // update the list of contacts depending on the search\n  function filterContacts() {\n    var searchText = searchBox.value.toLowerCase();\n    if (searchText.trim() == '') {\n      displayContacts(allContacts);\n    } else {\n      var results = fuse.search(searchText); // fuse allows for fuzzy search, more soft :)\n      var filteredContacts = results.map(function (result) {\n        return result.item;\n      });\n      displayContacts(filteredContacts);\n    }\n  }\n  window.filterContacts = filterContacts; // Make the function globally available for the HTML input's event\n\n  fetchContacts();\n\n  // Fuzzy search init\n  var options = {\n    includeScore: true,\n    keys: ['name']\n  };\n  var fuse;\n\n  // Transcript box and menu actions\n\n  window.onClickUploadButton = function () {\n    var selectedContactsStr = Object.keys(selectedContacts).map(function (contact) {\n      return \"[[\".concat(contact, \"]]\");\n    }).join(', ');\n    Object.keys(selectedContacts).forEach(function (contact) {\n      fetch('/api/mentions/add-mention', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({\n          contact: contact\n        })\n      }).then(function (response) {\n        return response.text();\n      }).then(function (data) {\n        return console.log('Upload response:', data);\n      })[\"catch\"](function (error) {\n        return console.error('Error:', error);\n      });\n    });\n    var transcriptionData = {\n      translation: transcriptBox.value,\n      // content received from the transcription endpoint\n      contacts: selectedContactsStr,\n      date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD\n    };\n    fetch('/uploadTranscription', {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(transcriptionData)\n    }).then(function (response) {\n      return response.text();\n    }).then(function (data) {\n      return console.log('Upload response:', data);\n    })[\"catch\"](function (error) {\n      return console.error('Error:', error);\n    });\n  };\n});\n\n// This could be in a login form submit handler\nfunction handleLogin(_x, _x2) {\n  return _handleLogin.apply(this, arguments);\n} // This function can be used for all your API requests\nfunction _handleLogin() {\n  _handleLogin = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(username, password) {\n    var response, data;\n    return _regeneratorRuntime().wrap(function _callee3$(_context3) {\n      while (1) switch (_context3.prev = _context3.next) {\n        case 0:\n          _context3.next = 2;\n          return fetch('https://your-api.com/login', {\n            method: 'POST',\n            headers: {\n              'Content-Type': 'application/json'\n            },\n            body: JSON.stringify({\n              username: username,\n              password: password\n            })\n          });\n        case 2:\n          response = _context3.sent;\n          _context3.next = 5;\n          return response.json();\n        case 5:\n          data = _context3.sent;\n          if (data.token) {\n            // Store the token securely\n            localStorage.setItem('authToken', data.token);\n          }\n        case 7:\n        case \"end\":\n          return _context3.stop();\n      }\n    }, _callee3);\n  }));\n  return _handleLogin.apply(this, arguments);\n}\nfunction apiRequest(_x3) {\n  return _apiRequest.apply(this, arguments);\n}\nfunction _apiRequest() {\n  _apiRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(url) {\n    var method,\n      body,\n      token,\n      headers,\n      _args4 = arguments;\n    return _regeneratorRuntime().wrap(function _callee4$(_context4) {\n      while (1) switch (_context4.prev = _context4.next) {\n        case 0:\n          method = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 'GET';\n          body = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : null;\n          token = localStorage.getItem('authToken');\n          headers = {\n            'Authorization': \"Bearer \".concat(token),\n            'Content-Type': 'application/json'\n          };\n        case 4:\n        case \"end\":\n          return _context4.stop();\n      }\n    }, _callee4);\n  }));\n  return _apiRequest.apply(this, arguments);\n}\nfunction checkAuth() {\n  var token = localStorage.getItem('jwtToken');\n  if (!token) {\n    window.location.href = 'login.html'; // Redirect to login if no token\n  } else {\n    fetch('/verifyToken', {\n      // Optional: Verify token with server\n      method: 'POST',\n      headers: {\n        'Authorization': \"Bearer \".concat(token),\n        'Content-Type': 'application/json'\n      }\n    }).then(function (response) {\n      if (!response.ok) {\n        throw new Error('Token verification failed');\n      }\n    })[\"catch\"](function (error) {\n      console.error('Error:', error);\n      localStorage.removeItem('jwtToken'); // Remove invalid token\n      window.location.href = 'login.html'; // Redirect to login\n    });\n  }\n}\n\n// Call checkAuth on page load\ndocument.addEventListener('DOMContentLoaded', checkAuth);\nfunction fetchProtectedData() {\n  var token = localStorage.getItem('jwtToken');\n  if (!token) {\n    alert('No token found, please login first');\n    return;\n  }\n  fetch('/protected', {\n    method: 'GET',\n    headers: {\n      'Authorization': \"Bearer \".concat(token)\n    }\n  }).then(function (response) {\n    if (response.status === 200) {\n      return response.text();\n    } else {\n      throw new Error('Access denied');\n    }\n  }).then(function (data) {\n    console.log('Protected data:', data);\n  })[\"catch\"](function (error) {\n    console.error('Error:', error);\n    alert('Access denied');\n  });\n}\n\n// Function to update the date in the header\nfunction updateDate() {\n  var days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];\n  var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];\n  var now = new Date();\n  var dayName = days[now.getDay()];\n  var day = now.getDate();\n  var month = months[now.getMonth()];\n  var fullDate = \"\".concat(dayName, \" \").concat(day, \" \").concat(month);\n  document.getElementById('current-date').textContent = fullDate;\n}\n\n// Call updateDate on page load\nupdateDate();\n\n//# sourceURL=webpack://package.json/./src/js/script.js?");

/***/ }),

/***/ "./src/sass/main.scss":
/*!****************************!*\
  !*** ./src/sass/main.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://package.json/./src/sass/main.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/script.js");
/******/ 	
/******/ })()
;