import Xml2js from 'xml2js';

/**
 * flag 是判定的类型: 1 唯一，2 包含，3 跳过，'x' 其他
 */
var FLAG_TYPE = {
  UNIQUE: 1,
  CONTAIN: 2,
  SKIP: 3,
  X: 'x' // others

};
var THREAD_FLAG_TYPE = {
  ORDER: 1,
  DISORDER: 2,
  INGORE: 3 // 忽略

};
/**
 * 用于判定的输入类型
 */

var MIME_TYPE = {
  JSDYNAMIC: 'jsDynamic',
  XML: 'xml',
  VECTOR: 'vector',
  IMAGE: 'image',
  AUDIO: 'audio'
};
/**
 * 判定结果错误类型
 */

var ERROR_TYPE = {
  // 正确
  NO_ERROR: 0,
  // 线程内积木
  BLOCK_MISTAKE: 1,
  BLOCK_MISSING: 2,
  BLOCK_EXCEEDED: 3,
  // 线程
  THREAD_MISSING: 11,
  THREAD_EXCEEDED: 12,
  // 参数
  FIELD_INPUT_MISTAKE: 21,
  SHADOW_INPUT_MISTAKE: 22,
  SHADOW_INPUT_OVERRIDE: 23,
  SHADOW_OVERRIDE_MISTAKE: 24,
  SHADOW_OVERRIDE_MISSING: 25,
  SHADOW_INPUT_UNKWOW: 26,
  // 用户错误 -1～-9 - 输入出错
  USERINPUT_EMPTY: -1,
  // 应用层错误 -10～-19
  USERINPUT_INVALID: -4,
  EXPECT_INVALID: -3,
  // 系统错误 - 数据源出错 -20～-29
  EXPECT_CONFIG_EMPTY: -20,
  EXPECT_ASSERT_DATA_EMPTY: -21,
  USER_ASSERT_DATA_EMPTY: -22,
  ILLEGAL_CONFIG_ERROR: -23,
  // 系统错误 - 超纲错误 -90～-99
  MINETYPE_NOT_SUPPORT: -98,
  UNKOWN_ERROR: -99 // 奇怪错误

};
var SHAPE = {
  BLOCK: 'block',
  SHADOW: 'shadow',
  STATEMENT: 'statement'
};
var SPECIAL_BLOCK = {
  COTRL_IF_ELSE: 'control_if_else'
};
var SIMILAR_TYPE = {
  BASE: 'base',
  COMPOSED: 'composed'
};
var CAPTURE_TYPE = {
  CLICK: 2,
  NO_CLICK: 1 // 非点击

};
var DYNAMIC_JUDGE_CONDITINO = {
  overtime: Symbol('overtime'),
  threadEnd: Symbol('threadEnd'),
  loopEnd: Symbol('loopEnd'),
  guessOk: Symbol('guessOk')
};

var isFunction = function isFunction(fn) {
  return typeof fn === 'function';
};

var isObject = function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

var isObjectEqual = function isObjectEqual(obj_a, obj_b) {
  return JSON.stringify(obj_a) === JSON.stringify(obj_b);
};

var isString = function isString(str) {
  return typeof str === 'string';
};

var isEmptyString = function isEmptyString(str) {
  return str.replace(/\s/g, '') === '';
};

var isArray = function isArray(arr) {
  return Array.isArray(arr);
};

var isJsCode = function isJsCode(str) {
  return isString(str);
};

var isVector = function isVector(arr) {
  return isArray(arr);
};

var isImage = function isImage(url) {
  return isString(url) && /\.(png|jpg|jepg)$/.test(url);
};

var isAudio = function isAudio(url) {
  return isString(url) && /\.(mp3|wav)$/.test(url);
};

var isNoneArray = function isNoneArray(arr) {
  return !isArray(arr) || arr.length === 0;
}; // 非数组 or 空数组
// todo 非严格判断


var isXml = function isXml(str) {
  return isString(str) && /<.+?>.*<\/.+?>|<.+?\/>/.test(str);
}; // todo 非严格判断

var clearXY = function clearXY(xml) {
  xml = xml.replace(/(x|y)="\S+?"(\s)?/g, '');
  return xml;
};

var clearComment = function clearComment(xml) {
  // <comment id="4Sr8@xDGUU-W$Sab]TOW" x="-435" y="532" h="200" w="200"></comment>
  xml = xml.replace(/<comment.+?<\/comment>/g, '');
  return xml;
};

var clearTableSpace = function clearTableSpace(xml) {
  return xml.replace(/\s{1,}/g, ' '); // 移除不必要的换行、空格
};

var toLowerCase = function toLowerCase(str) {
  return String(str).toLowerCase();
};

var pushArray = function pushArray(appler, array) {
  return array.length > 0 && Array.prototype.push.apply(appler, array);
};
/**
 * 清除杂项
 * @param xml xml string
 */


var wrapperWith = function wrapperWith(xml, label) {
  if (label === void 0) {
    label = 'xml';
  }

  return "<" + label + ">" + xml + "</" + label + ">";
};

var getTinyBlock = function getTinyBlock(source, attrs) {
  if (attrs === void 0) {
    attrs = ['id', 'type'];
  }

  return copyWith(source, attrs);
};

var getTinyWithin = function getTinyWithin(source, attrs) {
  if (attrs === void 0) {
    attrs = ['id', 'type', 'index'];
  }

  return getTinyBlock(source, attrs);
};

var toArray = function toArray(arr) {
  return Array.isArray(arr) ? arr : [arr];
}; // todo 优化类型

var copyWith = function copyWith(source, attrs, finalObj) {
  if (finalObj === void 0) {
    finalObj = {};
  }

  if (!source) {
    return null;
  }

  attrs.forEach(function (at) {
    finalObj[at] = source[at];
  });
  return finalObj;
};

var reduceArray = function reduceArray(arrs) {
  return arrs.reduce(function (x, y) {
    return x.concat(y);
  });
}; // const getTimeStamp = () => new Date().getTime();


var emptyFn = function emptyFn() {};

var mapDiffStr2Axis = function mapDiffStr2Axis(aStr, bStr) {
  return aStr === bStr ? 0 : aStr > bStr ? -1 : 1;
};

var getBlockArgSortFlag = function getBlockArgSortFlag(block) {
  if (isNoneArray(block.vals)) {
    return '';
  }

  var firstVal = block.vals[0];

  if (firstVal.type) {
    return firstVal.type;
  } else {
    return String(firstVal.val);
  }
};
var checkBlock = function checkBlock(block) {
  return !!(block.id && block.type && [SHAPE.BLOCK, SHAPE.STATEMENT, undefined].includes(block.shape));
};
var getChildBlock = function getChildBlock(block, i) {
  var child = [];

  if (!block || !block.type) {
    return child;
  }

  child.push({
    id: block.id,
    type: block.type,
    index: i
  });

  if (block.next) {
    var nextChild = getChildBlock(block.next.block, i);
    pushArray(child, nextChild);
    nextChild = null; // delete to gc
  }

  return child;
};
var findBlockIndex = function findBlockIndex(blockId, flatBlock) {
  for (var i = 0; i < flatBlock.length; i++) {
    var flat = flatBlock[i];

    if (blockId === flat.id) {
      return i;
    }
  }

  return -1;
};
var findBottomBlock = function findBottomBlock(flatBlock, topBlock) {
  if (!topBlock) {
    topBlock = flatBlock[0];
  }

  var nextBlock = topBlock.next;

  if (!nextBlock) {
    return topBlock; // topBlock is the bottomBlock
  }

  topBlock = flatBlock.find(function (fb) {
    return fb.id === nextBlock.id;
  });
  return findBottomBlock(flatBlock, topBlock);
};
var isBlockTypeSame = function isBlockTypeSame(a, b) {
  if (a && b) {
    return a.type === b.type;
  } // !a && !b => false


  return false;
};
var SOUP = '!#$%()*+,-./:;=?@[]^_{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var genUid = function genUid(n) {
  if (n === void 0) {
    n = 12;
  }

  var soupLength = SOUP.length;
  var id = [];

  for (var i = 0; i < n; i++) {
    id[i] = SOUP.charAt(Math.random() * soupLength);
  }

  return id.join('');
};

var Flags = Object.values(FLAG_TYPE);

var getFlagChecked = function getFlagChecked(flag) {
  if (typeof flag !== 'number' || !Flags.includes(flag)) {
    console.warn("flag should be one of [" + Flags.join(',') + "], but got " + flag);
    return false;
  }

  return true;
}; // 'xml' <= string && xml
// 'jsDynamic' <= string
// 'vector' <= []
// 'image' <= (png|jpg|jepg)
// 'audio' <= (.mp3|.wav)
// 每一个 type 会默认一个最佳方法进行判定


var mimeTypesChecker = {
  jsDynamic: {
    checkUserInput: isJsCode,
    checkExpectInput: isJsCode
  },
  xml: {
    checkUserInput: function checkUserInput(userInput) {
      if (!userInput || !isString(userInput) || isEmptyString(userInput)) {
        return undefined; // userInput 输入为空
      }

      return isXml(userInput);
    },
    checkExpectInput: function checkExpectInput(expectInput) {
      if (isNoneArray(expectInput)) {
        return undefined; // expected 输入为空
      } // 合法校验 todo


      return expectInput.every(function () {
        return getExpectInputsCheck();
      });
    }
  },
  vector: {
    checkUserInput: isVector,
    checkExpectInput: isVector
  },
  image: {
    checkUserInput: isImage,
    checkExpectInput: isImage
  },
  audio: {
    checkUserInput: isAudio,
    checkExpectInput: isAudio
  }
};
var MimeTypes = Object.values(MIME_TYPE);

var mimeTypeWarn = function mimeTypeWarn(mimeType) {
  console.warn("mimeType should be one of [ " + MimeTypes.join(',') + " ], but got " + mimeType);
  return false;
};

var getTypeChecker = function getTypeChecker(key) {
  if (!mimeTypesChecker[key]) {
    mimeTypeWarn(key);
    return undefined;
  }

  return mimeTypesChecker[key];
};

var getTypeChecked = function getTypeChecked(key) {
  if (MimeTypes.includes(key)) {
    return true;
  } else {
    return mimeTypeWarn(key);
  }
};

var getExpectInputsCheck = function getExpectInputsCheck() {
  return true;
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var createSimilarRefer = function createSimilarRefer(targetTree, targetIndex, sourceTree, sourceIndex) {
  if (targetTree === void 0) {
    targetTree = [];
  }

  if (targetIndex === void 0) {
    targetIndex = -1;
  }

  if (sourceTree === void 0) {
    sourceTree = [];
  }

  if (sourceIndex === void 0) {
    sourceIndex = -1;
  }

  return {
    targetTree: targetTree,
    targetIndex: targetIndex,
    sourceTree: sourceTree,
    sourceIndex: sourceIndex
  };
};

var Similar =
/** @class */
function () {
  function Similar(initAttrs) {
    this.id = genUid();
    this.type = SIMILAR_TYPE.BASE;
    this.amount = 0;
    this.rate = 0;
    this.unsimilarIndex = -1;
    this.groupDiffIndex = -1;
    this.refer = createSimilarRefer();
    this.referThread = createSimilarRefer();
    this.update(initAttrs);
  } // todo 对 refer 的优化


  Similar.prototype.update = function (attrs) {
    for (var attrKey in attrs) {
      this[attrKey] = attrs[attrKey];
    }
  };

  Similar.prototype.getData = function () {
    return {
      amount: this.amount,
      rate: this.rate,
      refer: this.refer,
      referThread: this.referThread,
      unsimilarIndex: this.unsimilarIndex,
      groupDiffIndex: this.groupDiffIndex // 整个线程 similar

    };
  }; // 绝对头部，整个线程首个积木是否相同
  // [a_b_c_d,a]


  Similar.prototype.isAbsHeadBlockSame = function () {
    var _a = this.referThread,
        targetTree = _a.targetTree,
        sourceTree = _a.sourceTree;
    var originTargetFirstBlock = targetTree[0]; // exist

    var originSouceFirstBlock = sourceTree[0]; // maybe not exist

    return isBlockTypeSame(originTargetFirstBlock, originSouceFirstBlock);
  }; // 当前相似片段，是否其头部积木相同


  Similar.prototype.isHeadBlockSame = function () {
    return this.unsimilarIndex !== 0; // -1 or > 0
  };

  return Similar;
}();
/**
 * 单线程下，寻找相似数目 + 首次差异(有价值的参考指标)
 *
 * 相似扫描，不论结构，只论积木 opcode
 * 如: (abcd, abxcd), (abcd, acbd)
 *
 * 为什么需要相似，因为能避免对结构细节的处理，先宽泛的匹配
 * todo 需增加一个权重系数
 **/

var getSimilarScan = function getSimilarScan(exptBlocks, userBlocks) {
  var sameAmount = 0;
  var diffIndex = -1;
  exptBlocks.forEach(function (expBlock, index) {
    var foundBlock = userBlocks.find(function (ub) {
      return ub.type === expBlock.type;
    });

    if (foundBlock) {
      sameAmount++; // 移除已消耗数据

      userBlocks = userBlocks.filter(function (ub) {
        return ub.id !== foundBlock.id;
      });
    } else if (diffIndex < 0) {
      diffIndex = index;
    }
  });
  return {
    sameAmount: sameAmount,
    diffIndex: diffIndex // 首次出现差异的 index

  };
}; // 寻找相似度
// https://www.cnblogs.com/chenxiangzhen/p/10648503.html

var getStatementAnalysis = function getStatementAnalysis(exptT, userT) {
  var analysisResult = {
    isEqual: true,
    firstDiffIndex: -1
  };

  if (exptT.shape === SHAPE.STATEMENT && userT.shape !== SHAPE.STATEMENT) {
    analysisResult = {
      isEqual: false,
      firstDiffIndex: 0,
      expected: exptT.child[0],
      received: null
    };
  } else if (exptT.shape !== SHAPE.STATEMENT && userT.shape === SHAPE.STATEMENT) {
    analysisResult = {
      isEqual: false,
      firstDiffIndex: 0,
      expected: null,
      received: userT.child[0]
    };
  } else {
    // 此时满足: exptT.shape === SHAPE.STATEMENT === userT.shape
    // 此时 exptT.child 和 userT.child 一定均存在
    var maxLen = Math.max(exptT.child.length, userT.child.length);

    for (var i = 0; i < maxLen; i++) {
      var exptChild = exptT.child[i];
      var userChild = userT.child[i];

      if (!exptChild || !userChild || !isBlockTypeSame(exptChild, userChild) || exptChild.index !== userChild.index) {
        analysisResult = {
          isEqual: false,
          firstDiffIndex: i,
          expected: exptChild,
          received: userChild
        };
        break;
      }
    }
  }

  return analysisResult;
}; // 全等 statement 结构独立处理


var getStatementEqualAnalysis = function getStatementEqualAnalysis(exptT, userT) {
  // 一定都是 statement，只是可能某一个 child 为空
  var statementAnalysis = getStatementAnalysis(exptT, userT);
  var isEqual = statementAnalysis.isEqual,
      firstDiffIndex = statementAnalysis.firstDiffIndex;

  if (isEqual) {
    return {
      isEqual: true,
      expectAt: {}
    };
  } // 不等时，一定是 statement 的 child 不等
  // 一定是 within 的


  var expectAt = {
    within: getTinyBlock(userT)
  }; // fix special block if_else

  if (exptT.type === SPECIAL_BLOCK.COTRL_IF_ELSE) {
    var expected = statementAnalysis.expected,
        received = statementAnalysis.received;
    expectAt.within.index = (expected || received).index;
  }

  if (firstDiffIndex > 0) {
    expectAt.after = getTinyBlock(userT.child[firstDiffIndex - 1]);
  }

  return __assign({
    expectAt: expectAt
  }, statementAnalysis);
};
/**
 * 任何 2 个片段全等分析
 * 整个线程有可能是散开的，这里只分析最小片段，而非整个线程
 *
 * 绝大部分情况是next连接的，自上而下对比即可；
 * 有循环体结构出现时，则需额外特别处理
 *
 * 还有一个特别情况，就是积木被抽离后，其形式相同，其执行逻辑被破坏
 * 比如有个无解的问题：
 * 1、if{a}a 中的第一个 a 被无序匹配抽离后，其扁平化 if{}a 和纵深结构 if{a}还是等价的。
 *
 * @param exptTree
 * @param userTree
 * @param checkStatement 是否检查 statement 结构
 */


var getEqualAnalysis = function getEqualAnalysis(exptTree, userTree, referThread, checkStatement) {
  if (checkStatement === void 0) {
    checkStatement = true;
  }

  var maxLen = Math.max(exptTree.length, userTree.length);

  for (var i = 0; i < maxLen; i++) {
    var exptT = exptTree[i];
    var userT = userTree[i];

    if (isBlockTypeSame(exptT, userT)) {
      // 特别的，要进行下一个积木预匹配，以确定逻辑关系是否破坏
      // 这是因为一些无序解，可能抢占 userT.next 积木
      // 所以 exptT.next 存在我希望 userT.next 也存在，且相等
      if (exptT.next) {
        if (!isBlockTypeSame(exptT.next, userT.next)) {
          return {
            isEqual: false,
            expected: exptT.next,
            received: userT.next,
            expectAt: {
              after: getTinyBlock(userT)
            }
          };
        }
      } // 尝试进入到 statement 结构


      if (exptT.shape === SHAPE.STATEMENT || userT.shape === SHAPE.STATEMENT) {
        // 此时一定都是 statement，差别可能某一个 child 为空
        // 免检
        if (!checkStatement) {
          continue;
        }

        var diff = getStatementEqualAnalysis(exptT, userT);

        if (!diff.isEqual) {
          return diff;
        } // statement 结构比较完后，因为结构被拍平了，所以还会继续走 for 循环去对比其 child

      }
    } else {
      // 进到 next 连接结构
      var expectAt = {}; // 首积木错误，是分片的首积木错误，并不一定是整个线程的首积木错误哦

      if (i === 0) {
        // 首积木存在，但错用
        if (userT) {
          if (userT.prev) {
            expectAt.after = getTinyBlock(userT.prev);
          } else {
            var targetTree = referThread.targetTree; // 错误的首积木，却于正确解的第2个积木相同

            if (isBlockTypeSame(userT, targetTree[1])) {
              expectAt.before = getTinyBlock(userT);
            } else {
              expectAt.replace = getTinyBlock(userT);
            }
          }
        } // 首积木不存在，是空缺
        else if (exptT) {
            var sourceTree = referThread.sourceTree; // 因 exptT 是首积木，故 exptT.prev 一定不存在
            // 且 userT 也不存在，首积木也不存在，故 userTree 一定为空
            // 此时求助整个线程，但需处理 statement 结构

            if (sourceTree.length) {
              expectAt.after = getTinyBlock(findBottomBlock(sourceTree));
            } else {
              expectAt.thread = null;
            }
          } // no else

      } else {
        // 非首积木错误，大可放心前面均有锚点积木
        // userT 存在则只用 userT.prev 即可
        // exptT 存在，需 exptT.prev 对应的索引位置到 userT
        if (userT) {
          expectAt = {
            after: getTinyBlock(userT.prev)
          };
        } else if (exptT) {
          // userT must be empty, and userT.prev must be exist
          // think about statement, so we should use exptT.prev to position
          var exptPrevIndex = exptT.prev ? findBlockIndex(exptT.prev.id, exptTree) : findBlockIndex(exptT.id, exptTree) - 1;
          expectAt.after = getTinyBlock(userTree[exptPrevIndex]);
        } // not else

      }

      return {
        isEqual: false,
        expected: exptT,
        received: userT,
        expectAt: expectAt
      };
    }
  }

  return {
    isEqual: true,
    expectAt: {}
  };
};
/**
 * 比较对等队列
 * @param targetTree
 * @param sourceTree
 */


var compareEqualQueue = function compareEqualQueue(targetTree, sourceTree, referThread) {
  var equalResult = getEqualAnalysis(targetTree, sourceTree, referThread);
  var isEqual = equalResult.isEqual,
      expected = equalResult.expected,
      received = equalResult.received;

  if (isEqual) {
    return __assign({
      errorType: ERROR_TYPE.NO_ERROR
    }, equalResult);
  }

  var errorType = ERROR_TYPE.UNKOWN_ERROR;

  if (expected && received) {
    errorType = ERROR_TYPE.BLOCK_MISTAKE;
  } else if (expected && !received) {
    errorType = ERROR_TYPE.BLOCK_MISSING;
  } else if (!expected && received) {
    errorType = ERROR_TYPE.BLOCK_EXCEEDED;
  }

  return __assign({
    errorType: errorType
  }, equalResult);
};

var compareEqualQueueBase = function compareEqualQueueBase(similar) {
  var _a = similar.refer,
      targetTree = _a.targetTree,
      sourceTree = _a.sourceTree;
  var equalResult = compareEqualQueue(targetTree, sourceTree, similar.referThread);
  return equalResult;
};
/**
 * 两个相似片段，进行全等比较
 * 相似片段，不一定执行流（逻辑）上是全等的
 *
 * @param similarPice
 */

var checkEqualofSimilarPice = function checkEqualofSimilarPice(similarPice) {
  var rate = similarPice.rate;

  if (rate === 1) {
    var _a = similarPice.refer,
        targetTree = _a.targetTree,
        sourceTree = _a.sourceTree;
    var isEqual = checkFlowEqual(targetTree, sourceTree);
    return isEqual;
  }

  return false;
}; // 对于相似率 = 1 的两个 pice，检查其原始是否全等——而非经过抽离、塌缩后的全等

var checkFlowEqual = function checkFlowEqual(targetTree, sourceTree) {
  var exptLen = targetTree.length;
  var userLen = sourceTree.length;

  if (exptLen !== userLen) {
    return false;
  }

  if (exptLen === 1 && isBlockTypeSame(targetTree[0], sourceTree[0])) {
    return true;
  }

  var targetFlow = getBlockFlow(targetTree);
  var sourceFlow = getBlockFlow(sourceTree);
  return JSON.stringify(targetFlow) === JSON.stringify(sourceFlow);
}; // 执行序列拆解


var getBlockFlow = function getBlockFlow(flatTree) {
  var usedIds = [];
  var flows = [];
  var currentBranch = -1;
  var len = flatTree.length;
  var indexArr = new Array(len).fill(0).map(function (x, i) {
    return i;
  });
  var newBranch = false;

  var _loop_1 = function _loop_1(i) {
    var block = flatTree[i];

    if (!block.prev || i === 0 || newBranch) {
      currentBranch++;
      flows[currentBranch] = [];
      newBranch = false;
    }

    flows[currentBranch].push(block.type);
    usedIds.push(i);

    if (usedIds.length === flatTree.length) {
      return out_i_1 = i, "break";
    }

    if (block.next) {
      i = flatTree.findIndex(function (ft) {
        return ft.id === block.next.id;
      });
    } else {
      i = -1;
    }

    if (i === -1) {
      // 执行流这条线断了，需另寻开头。开头在未曾使用 i 中
      i = indexArr.find(function (index) {
        return !usedIds.includes(index);
      });
      newBranch = true;
    }

    out_i_1 = i;
  };

  var out_i_1;

  for (var i = 0; i < flatTree.length;) {
    var state_1 = _loop_1(i);

    i = out_i_1;
    if (state_1 === "break") break;
  }

  return flows;
};

var shouldNotCheck = function shouldNotCheck(argsJudgeArr) {
  return isNoneArray(argsJudgeArr) || !argsJudgeArr.includes(false);
};

var getSingleBlockArgsCompared = function getSingleBlockArgsCompared(targetBlock, sourceBlock, ignoreArgs) {
  var targetVals = targetBlock.vals,
      id = targetBlock.id;
  var sourceVals = sourceBlock.vals;
  var argsJudgeArr = ignoreArgs[id];

  if (shouldNotCheck(argsJudgeArr) || !targetVals) {
    return undefined;
  }

  for (var j = 0; j < argsJudgeArr.length; j++) {
    // 枚举本积木的每一个参数(a,b,c)
    var isIgnore = argsJudgeArr[j];

    if (isIgnore) {
      // true
      continue;
    }

    var tValBlock = targetVals[j];
    var sValBlock = sourceVals ? sourceVals[j] || {} : {}; // 积木 shadow 及可 override 类型参数的判定
    // 参数是 Block 时

    if (tValBlock && tValBlock.type) {
      // user 实际给出的 block 为空
      // 这在 if_else 等空参积木会出现
      if (!sValBlock.type) {
        return {
          expectAt: sourceBlock,
          fieldMsg: {
            actualArg: null,
            expectArg: tValBlock,
            argIndex: j
          },
          argErrorType: ERROR_TYPE.SHADOW_OVERRIDE_MISSING
        };
      } // expect 参数的 block 和 user 实际给出的 block (存在但) 不一致
      // 1、expect 参数的 block 是个 shadow 类型; user 是一个 shadow 但 shadow 值不相同
      // 1、expect 参数的 block 是个 shadow 类型; user 却是一个 x_block
      // 2、expect 参数的 block 是个 block 类型; user 却是一个 shadow
      // 2、expect 参数的 block 是个 block 类型; user 却是一个 x_block
      else if (tValBlock.shape === SHAPE.SHADOW) {
          // 同为 shadow 只需比较 shadow 值
          if (sValBlock.shape === SHAPE.SHADOW) {
            var tShadowVals = tValBlock.vals;
            var sShadowVals = sValBlock.vals;

            if (tShadowVals && sShadowVals) {
              var tShadowVal = tShadowVals[0];
              var sShadowVal = sShadowVals[0];

              if (toLowerCase(tShadowVal.val) !== toLowerCase(sShadowVal.val)) {
                return {
                  expectAt: sourceBlock,
                  fieldMsg: {
                    actualArg: sValBlock,
                    expectArg: tValBlock,
                    argIndex: j
                  },
                  argErrorType: ERROR_TYPE.SHADOW_INPUT_MISTAKE // shadow 输入错误

                };
              }
            }
          } else {
            // 期望 shadow 但放置了一个 block
            return {
              expectAt: sourceBlock,
              fieldMsg: {
                actualArg: sValBlock,
                expectArg: tValBlock,
                argIndex: j
              },
              argErrorType: ERROR_TYPE.SHADOW_INPUT_OVERRIDE // shadow 被覆盖

            };
          }
        } else {
          // 覆盖缺失，本应覆盖积木但无覆盖
          if (sValBlock.shape === SHAPE.SHADOW) {
            return {
              expectAt: sourceBlock,
              fieldMsg: {
                actualArg: sValBlock,
                expectArg: tValBlock,
                argIndex: j
              },
              argErrorType: ERROR_TYPE.SHADOW_OVERRIDE_MISSING
            };
          } // must be block type
          // 本应覆盖积木，但覆盖了错误积木
          else if (!isBlockTypeSame(tValBlock, sValBlock)) {
              return {
                expectAt: sourceBlock,
                fieldMsg: {
                  actualArg: sValBlock,
                  expectArg: tValBlock,
                  argIndex: j
                },
                argErrorType: ERROR_TYPE.SHADOW_OVERRIDE_MISTAKE
              };
            }
        }
    } // should be Field
    else {
        var tFieldVal = tValBlock.val;
        var sFieldVal = sValBlock.val;

        if (toLowerCase(sFieldVal) !== toLowerCase(tFieldVal)) {
          return {
            expectAt: sourceBlock,
            fieldMsg: {
              actualArg: sFieldVal,
              expectArg: tFieldVal,
              argIndex: j
            },
            argErrorType: ERROR_TYPE.FIELD_INPUT_MISTAKE
          };
        }
      }
  }

  return undefined;
};
/**
 * 将参数积木扁平化
 * 特别说明：field, shadow 形状将不会推入 flat 队列
 */

var getFlattenArgs = function getFlattenArgs(flatblock) {
  var flatVals = [];

  if (checkBlock(flatblock)) {
    flatVals.push(flatblock);
  } else {
    return flatVals;
  }

  var vals = flatblock.vals;

  if (isArray(vals)) {
    for (var _i = 0, vals_1 = vals; _i < vals_1.length; _i++) {
      var valBlock = vals_1[_i];
      var flatArgs = getFlattenArgs(valBlock);
      pushArray(flatVals, flatArgs);
      flatArgs = null; // gc
    }
  }

  return flatVals;
};
var getEqualQueueArgsCompared = function getEqualQueueArgsCompared(targetFlat, sourceFlat, ignoreArgs) {
  for (var i = 0; i < targetFlat.length; i++) {
    var targetBlock = targetFlat[i];
    var sourceBlock = sourceFlat[i];
    var id = targetBlock.id,
        vals = targetBlock.vals;
    var argsJudgeArr = ignoreArgs[id];

    if (shouldNotCheck(argsJudgeArr) || !vals) {
      // => [true, true] is all skip checking
      continue;
    } // // 扁平化需检查的积木 的所有嵌入的参数


    var tFlatArgsBlock = getFlattenArgs(targetBlock);
    var sFlatArgsBlock = getFlattenArgs(sourceBlock);

    for (var j = 0; j < tFlatArgsBlock.length; j++) {
      var tSingleBlock = tFlatArgsBlock[j];
      var sSingleBlock = sFlatArgsBlock[j]; // 容错: 配置数据导致与 user 实际长度有差别

      if (!sSingleBlock) {
        continue;
      }

      var argsCompared = getSingleBlockArgsCompared(tSingleBlock, sSingleBlock, ignoreArgs);

      if (argsCompared) {
        return __assign({
          which: i
        }, argsCompared);
      }
    }
  }

  return undefined;
};

var LOST_MATCH_PLACEMENT = 'x'; // x 表示不匹配，作为占位符

var dropPlacementRE = /x,|,x|x/g; // 剔除占位符

var expandPath = function expandPath(prevPath, nextItem) {
  if (nextItem.length === 0) {
    return [prevPath + "," + LOST_MATCH_PLACEMENT];
  }

  var localPath = nextItem.map(function (item) {
    return prevPath + "," + String(item);
  });
  return localPath; // 发散成若干个
};

var clean = function clean(tobeClean, nextItem) {
  // todo '10', '12' 这样的这次未处理
  // const cleans = tobeClean.split(',').map(c => Number(c));
  return nextItem.filter(function (a) {
    return !tobeClean.includes(String(a));
  });
};

var getTrueLen = function getTrueLen(str) {
  return (str || '').replace(dropPlacementRE, '').length;
}; // 剔除占位符


var MatchPath = {
  matchedArr: [],
  totalLength: 0,
  initPaths: [],
  init: function init(matchedArr) {
    MatchPath.matchedArr = matchedArr;
    MatchPath.totalLength = matchedArr.length;
    MatchPath.initPaths = matchedArr[0].length > 0 ? matchedArr[0].map(function (i) {
      return String(i);
    }) : [LOST_MATCH_PLACEMENT];
  },
  getPaths: function getPaths(allPath, cursor) {
    if (cursor > MatchPath.totalLength - 1) {
      return allPath;
    }

    var newAllPath = [];
    var nextItem = MatchPath.matchedArr[cursor];
    allPath.forEach(function (str) {
      var cleanNextItem = clean(str, nextItem);
      var paths = expandPath(str, cleanNextItem);
      newAllPath.push.apply(newAllPath, paths);
    });
    allPath = null; // 释放

    return MatchPath.getPaths(newAllPath, ++cursor);
  },

  /**
   * 获取所有匹配路径 ['1,x,0,2,3'] 说明第 i 项匹配的是该项的 value。
   * 如：第0项匹配了线程'1'，第1项匹配了 'x'('x'表示未匹配到任何线程)
   * @param matchedArr
   * @returns like ['1,x,0,2,3', '0,2,x,3,1']
   */
  getAllPaths: function getAllPaths(matchedArr) {
    MatchPath.init(matchedArr);
    var result = MatchPath.getPaths(MatchPath.initPaths, 1);
    return result;
  },
  getLongestPaths: function getLongestPaths(matchedArr) {
    var allPath = MatchPath.getAllPaths(matchedArr);

    if (allPath.length === 0) {
      return [];
    }

    var max = Math.max.apply(Math, allPath.map(function (ap) {
      return getTrueLen(ap);
    }));
    return allPath.filter(function (ap) {
      return max === getTrueLen(ap);
    });
  },
  isAllMatched: function isAllMatched(longestPath) {
    return getTrueLen(longestPath) === longestPath.length;
  },
  splitLostAndMatched: function splitLostAndMatched(longestPath) {
    var longestArr = longestPath.split(',');
    var lostIndex = longestArr.findIndex(function (v) {
      return v === LOST_MATCH_PLACEMENT;
    });
    var matchThreads = longestArr.filter(function (m) {
      return m !== LOST_MATCH_PLACEMENT;
    }).map(function (i) {
      return Number(i);
    });
    return {
      lostIndex: lostIndex,
      matchThreads: matchThreads
    };
  }
};

var SimilarAnalysis =
/** @class */
function () {
  function SimilarAnalysis() {
    this.matchPaths = [];
    this.matches = {};
    this.missing = {};
  } // 重置数据


  SimilarAnalysis.prototype.reset = function () {
    this.matchPaths = [];
    this.matches = {};
    this.missing = {};
  };

  SimilarAnalysis.prototype.add = function (i, matchResult) {
    var matches = matchResult.matches,
        similars = matchResult.similars;
    this.matchPaths.push(Object.keys(matches).map(function (it) {
      return Number(it);
    })); // 记录第 i 个线程的 匹配情况

    this.matches[i] = matches; // 记录第 i 个线程的 相似情况

    this.missing[i] = similars;
  }; // 剔除那些已经被完全匹配过的线程——它们已有最佳归属


  SimilarAnalysis.prototype.getTopSimilar = function (i, matchThreads) {
    var similars = this.missing[i];

    if (isNoneArray(similars)) {
      return undefined;
    }

    var remainSimilar = similars.filter(function (similar) {
      return !matchThreads.includes(similar.referThread.sourceIndex);
    });
    return remainSimilar[0]; // 也许 matchGroup 被用完了，所以余留下的为空
  }; // 获得线程 i 的第一块碎片


  SimilarAnalysis.prototype.getTopPice = function (i, expectBlockTrees) {
    var similars = this.missing[i];
    var lostThread = similars[0] && similars[0].refer.targetTree[0];

    if (lostThread) {
      return lostThread;
    }

    var defaultThread = expectBlockTrees[i];
    return toArray(defaultThread)[0];
  }; // 获得匹配地图
  // ['1,0,2,3'] => ['1', '0', '2', '3'] => {0:'1', 1: '0', 2:'2', 3:'3'}


  SimilarAnalysis.prototype.getMatchedMap = function (mathedPath) {
    var _this = this;

    var sames = [];
    mathedPath.forEach(function (sourceIndex, targetIndex) {
      var matches = _this.matches[targetIndex];
      sames.push(matches[sourceIndex]);
    });
    return sames;
  }; // 获得最长匹配路径


  SimilarAnalysis.prototype.getMatchest = function () {
    return MatchPath.getLongestPaths(this.matchPaths);
  }; // 检查丢失匹配


  SimilarAnalysis.prototype.checkLost = function (longestPaths) {
    // 只需拿出第一条即可
    return !MatchPath.isAllMatched(longestPaths[0]);
  }; // 获得 lost 和 matched


  SimilarAnalysis.prototype.getLostAndMatched = function (longestPaths) {
    // 只需拿出第一条即可
    return MatchPath.splitLostAndMatched(longestPaths[0]);
  };

  return SimilarAnalysis;
}();
var similarsSort = function similarsSort(similars) {
  return similars.sort(function (a, b) {
    return b.rate - a.rate || b.unsimilarIndex - a.unsimilarIndex;
  });
}; // 获取全等 similar

var getEqualSimilars = function getEqualSimilars(similarRank) {
  return similarRank.filter(function (sr) {
    return checkEqualofSimilarPice(sr);
  });
}; // 获得未匹配的 expect

var getUnmatchedExpectThread = function getUnmatchedExpectThread(blockTrees, matchedThreads) {
  var matchedThreadsIndex = matchedThreads.map(function (sr) {
    return sr.refer.targetIndex;
  });
  var unmatchThread = blockTrees.find(function (eb, i) {
    return !matchedThreadsIndex.includes(i);
  });
  return unmatchThread;
}; // 获得未匹配的 source

var getUnoccupiedSourceThread = function getUnoccupiedSourceThread(similarRank, matchedThreads) {
  var matchedUserThreadsIndex = matchedThreads.map(function (t) {
    return t.refer.sourceIndex;
  });
  var picked = similarRank.find(function (sr) {
    return !matchedUserThreadsIndex.includes(sr.refer.sourceIndex);
  });
  return picked;
};
var SimilarAnalysis$1 = new SimilarAnalysis();

/**
 * 最核心的几个概念：
 * 1、任意片段的相似，与等长片段的全等
 * 2、片段的相似与整个线程的相似
 */
/**
 * 获得执行流 tree
 * @param xml string 积木块的 xml
 */

var getStreamTree = function getStreamTree(xml) {
  return __awaiter(void 0, void 0, void 0, function () {
    var topLabel, xml_c, Parser;
    return __generator(this, function (_a) {
      topLabel = 'xml';
      xml_c = wrapperWith(clearComment(clearXY(clearTableSpace(xml))), topLabel);
      Parser = new Xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        ignoreAttrs: false,
        charkey: 'val'
      });
      return [2
      /*return*/
      , new Promise(function (resolve, reject) {
        Parser.parseString(xml_c, function (err, resultObj) {
          if (err) {
            var msg = {
              error: err
            };
            reject(msg);
          }

          var contentObj = resultObj[topLabel];

          if (!contentObj) {
            var msg = {
              error: 'empty xml'
            };
            reject(msg);
          } // todo 合法校验


          if (!isObject(contentObj)) {
            var msg = {
              error: 'illegal xml'
            };
            reject(msg);
          }

          var variables = contentObj.variables;

          if (variables && variables.variable) {
            contentObj.variable = variables.variable;
            delete contentObj.variables;
          } else {
            contentObj.variable = [];
          }

          var block = contentObj.block;

          if (block) {
            contentObj.block = toArray(block);
          } else {
            contentObj.block = [];
          }

          resolve(contentObj);
        });
      })];
    });
  });
};
/**
 * 重要：扁平化 block tree
 * 重要性在于扁平化后，不能丢失纵深树的基本信息
 *
 * @param blockTree 纵深结构 Block
 * @param shape 积木 shape 类型
 * @param prev 本积木之前的积木，对应有个 next 积木
 */

var getFlattenTree = function getFlattenTree(blockTree, shape, prev) {
  if (shape === void 0) {
    shape = SHAPE.BLOCK;
  }

  var blockArr = [];

  if (!blockTree) {
    return blockArr;
  }

  var block = {
    type: blockTree.type,
    id: blockTree.id,
    shape: shape,
    prev: prev
  };
  blockArr.push(block); // 处理 block 参数

  var fields = blockTree.field; // 可能是数组

  if (fields) {
    if (!block.vals) {
      block.vals = [];
    }

    if (!Array.isArray(fields)) {
      fields = [fields];
    }

    pushArray(block.vals, fields);
    fields = null; // gc
  }

  var values = blockTree.value;

  if (values) {
    if (!block.vals) {
      block.vals = [];
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    values.forEach(function (v) {
      var valueBlockTree = v.block || v.shadow; // 优先取 block

      var valueBlockArr = getFlattenTree(valueBlockTree, v.block ? SHAPE.BLOCK : SHAPE.SHADOW);
      pushArray(block.vals, valueBlockArr);
      valueBlockArr = null; // delete to gc
    });
  } // 注意⚠️ 一个 statement 只有内嵌了 block, 才会标记成真的 statement
  // 所以例如 "control_repeat" 没有内嵌积木，是不会带 statement 属性的


  var statement = blockTree.statement;

  if (statement) {
    var statements = statement;

    if (!Array.isArray(statement)) {
      statements = [statement];
    } // 保证有效的 statement


    if (statements[0].block) {
      // 当积木有内嵌，成为了真正的 statement 时，需修正 shape
      block.shape = SHAPE.STATEMENT;
      block.child = [];
      statements.forEach(function (st, i) {
        var statementBlockTree = st.block;
        var childs = getChildBlock(statementBlockTree, i);
        pushArray(block.child, childs);
        childs = null;
        var statementBlockArr = getFlattenTree(statementBlockTree);
        pushArray(blockArr, statementBlockArr);
        statementBlockArr = null; // delete to gc
      });
    }
  }

  var next = blockTree.next;

  if (next) {
    var nextBlockTree = next.block;

    if (nextBlockTree) {
      // when has next block
      block.next = getTinyBlock(blockTree.next.block); // block is the prevBlock of the next block

      var prevBlock = getTinyBlock(block);
      var nextBlockArr = getFlattenTree(nextBlockTree, SHAPE.BLOCK, prevBlock);
      pushArray(blockArr, nextBlockArr);
      nextBlockArr = null; // delete to gc
    }
  }

  return blockArr;
};
/**
 * 森林中有很多树，多棵树的扁平化，即扁平森林
 */

var getFlattenForest = function getFlattenForest(trees) {
  var flattenTrees = trees.map(function (tree) {
    return getFlattenTree(tree);
  });
  return flattenTrees;
};
/**
 * 深度树形结构的相似度排名
 * @param expectTrees 期望值
 * @param userTrees 用户值，深度树形结构
 * @param ignoreBlock
 */

var getDeepTreeSimilarRank = function getDeepTreeSimilarRank(expectTrees, userTrees, isSort) {
  if (!Array.isArray(expectTrees) || !Array.isArray(userTrees)) {
    return [];
  } // 深度树会转化成扁平树，进行排序


  var exptFlattens = getFlattenForest(expectTrees);
  var useFlattens = getFlattenForest(userTrees);
  return getSimilarRateRank(isSort ? sortByTopNode(exptFlattens) : exptFlattens, isSort ? sortByTopNode(useFlattens) : useFlattens);
};
/**
 * 扁平树形结构的相似度排名
 * @param expectTrees 期望值
 * @param userTrees 用户值，扁平树形结构
 * @param ignoreBlock
 */

var getFlattenTreeSimilarRank = function getFlattenTreeSimilarRank(expectTrees, userTrees) {
  if (!Array.isArray(expectTrees) || !Array.isArray(userTrees)) {
    return [];
  }

  return getSimilarRateRank(expectTrees, userTrees);
};
/**
 * 获取相似度排名
 * source 向 target 执行相似。tempResult 的个数至少等于 targetPices.length
 * @example
 * @param targetPices
 * @param soucePices
 */

var getSimilarRateRank = function getSimilarRateRank(targetPices, sourcePices) {
  var sourcePicesLength = sourcePices.length;
  var highSimilars = [];
  var tempSimilars = [];
  var picked = [];

  for (var i = 0; i < targetPices.length; i++) {
    var exp = targetPices[i]; // 线程序列

    var initRefer = createSimilarRefer(exp, i); // sourcePices 为空，也会生成相似值
    // sourcePices 全部用完，targetPices 多出的相似均为 0

    if (picked.length === sourcePicesLength) {
      var tempResult = new Similar({
        refer: initRefer
      });
      var diffIndex = getSimilarScan(exp, []).diffIndex;
      tempResult.update({
        unsimilarIndex: diffIndex
      });
      tempSimilars.push(tempResult);
      continue;
    }

    var _loop_1 = function _loop_1(j) {
      var tempResult = new Similar({
        refer: initRefer
      });

      if (picked.includes(j)) {
        return "continue";
      }

      var source = sourcePices[j];

      var _a = getSimilarScan(exp, source),
          sameAmount = _a.sameAmount,
          diffIndex = _a.diffIndex;

      var rate = sameAmount / exp.length * (sameAmount / source.length);
      var refer = createSimilarRefer(exp, i, source, j);
      tempResult.update({
        unsimilarIndex: diffIndex,
        rate: rate,
        amount: sameAmount,
        refer: refer,
        referThread: refer
      });

      if (rate === 1) {
        picked.push(j);
        highSimilars.push(tempResult); // 还要剔除之前误入的匹配

        tempSimilars = tempSimilars.filter(function (ts) {
          return ts.refer.targetIndex !== tempResult.refer.targetIndex;
        });
        return "break";
      } else {
        tempSimilars.push(tempResult);
      }
    }; // sourcePices 中全相似的线程，不再参与匹配
    // 匹配度rate < 1 则继续匹配


    for (var j = 0; j < sourcePicesLength; j++) {
      var state_1 = _loop_1(j);

      if (state_1 === "break") break;
    }
  }

  var lowerSimilars = [];

  if (tempSimilars.length) {
    var pickedTemp_1 = [];
    similarsSort(tempSimilars).forEach(function (temp) {
      if (!pickedTemp_1.includes(temp.refer.targetIndex)) {
        lowerSimilars.push(temp);
      }
    });
  }

  return highSimilars.concat(lowerSimilars);
};
var getSimilarBaseHead = function getSimilarBaseHead(targetFlatten, sourceFlatten) {
  var HeadSimilarPices = [];
  var targetFirstBlock = targetFlatten[0];
  var targetFlattenLength = targetFlatten.length; // 收集线程碎片

  sourceFlatten.forEach(function (item, i) {
    if (item.type === targetFirstBlock.type) {
      HeadSimilarPices.push({
        segment: sourceFlatten.slice(i, i + targetFlattenLength),
        startIndex: i
      });
    }
  });
  return HeadSimilarPices;
};
/**
 * 匹配结果是：1对多，1个 target 匹配多个 source
 */

var matchGroupFlatTree = function matchGroupFlatTree(expectDeepTree, sourceAllThreads, isOrdered, originTargetIndex) {
  var targetMatchResult = {
    similars: [],
    matches: {}
  }; // 获得扁平化碎片 forest，尽管它们是树林，但绝对不能进行重排序

  var targetFlatPices = getFlattenForest(expectDeepTree);
  var targetFlatPicesLength = targetFlatPices.length;
  var originTargetFlatten = reduceArray(targetFlatPices); // 每个 user 线程都会与  targetFlatPices 进行一次匹配

  for (var i = 0; i < sourceAllThreads.length; i++) {
    var originSourceThread = sourceAllThreads[i];
    var sourceThread = originSourceThread;
    var currentMatch = {
      piceCount: 0,
      blockAmount: 0,
      firstDiffGroupIndex: -1,
      isPicked: false,
      sames: [] // 本次匹配被选中的片段

    };
    var pickedSimilar = new Similar({
      type: SIMILAR_TYPE.COMPOSED
    });
    var disorderMaxSimilar = new Similar({
      type: SIMILAR_TYPE.COMPOSED
    });

    for (var j = 0; j < targetFlatPicesLength; j++) {
      var targetFlat = targetFlatPices[j]; // 将 sourceThread 一个线程拆成 n 个首部相同的片段

      var headSimilarPices = getSimilarBaseHead(targetFlat, sourceThread);
      var allSimilarPices = headSimilarPices.map(function (pice) {
        return pice.segment;
      }); // 相似碎片为空，则已整个 sourceThread 代替，这对定位提示非常重要

      if (allSimilarPices.length === 0) {
        allSimilarPices = [sourceThread];
      } // targetGroupPices 的每一个 pice 与上述打散的片段进行相似比较，每次取其中最相似的片段
      // 此时，topSimilarPice 的 refer 和 referThread 是指向碎片的，需要修正 referThread


      var topSimilarPice = getFlattenTreeSimilarRank([targetFlat], allSimilarPices)[0]; // refer 碎片引用是准确的

      var refer = Object.assign({}, topSimilarPice.refer, {
        targetIndex: j // target 碎片序号，需在此更新

      });
      var referThread = createSimilarRefer(originTargetFlatten, originTargetIndex, originSourceThread, i);
      topSimilarPice.update({
        refer: refer,
        referThread: referThread
      }); // 记录相似数

      currentMatch.blockAmount += topSimilarPice.amount; // 全等匹配

      if (checkEqualofSimilarPice(topSimilarPice)) {
        currentMatch.piceCount += 1;
        currentMatch.sames.push(topSimilarPice);
        var startIndex = headSimilarPices[topSimilarPice.refer.sourceIndex].startIndex;
        var cursorIndex = startIndex + targetFlat.length; // 有序，则截去匹配积木及以前的积木

        if (isOrdered) {
          sourceThread = sourceThread.slice(cursorIndex);
        } else {
          // 无序，则挖掉匹配过的积木
          sourceThread = sourceThread.slice(0, startIndex).concat(sourceThread.slice(cursorIndex));
        }
      } // 非全等匹配的
      else {
          // 记录下首次组差异的序号
          if (currentMatch.firstDiffGroupIndex === -1) {
            currentMatch.firstDiffGroupIndex = j;
          } // 首次且唯一提取一次 Similar 样本


          if (!currentMatch.isPicked) {
            // 有序，只取得第一次出现差异的片段，作为本线程最终解释
            // 无序，同样如此，只是后面可能根据 rate 而更新片段
            pickedSimilar.update(topSimilarPice.getData());
            currentMatch.isPicked = true;
          }

          if (!isOrdered) {
            if (topSimilarPice.rate > disorderMaxSimilar.rate) {
              disorderMaxSimilar.update(topSimilarPice.getData());
              pickedSimilar.update(topSimilarPice.getData());
            }
          }
        }
    } // 从线程整体看，是否被匹配，线程的最大相似


    if (currentMatch.piceCount === targetFlatPicesLength) {
      targetMatchResult.matches[i] = currentMatch.sames;
    } else {
      var rate = currentMatch.blockAmount / originTargetFlatten.length;
      var amount = currentMatch.blockAmount;
      pickedSimilar.update({
        rate: rate,
        amount: amount,
        groupDiffIndex: currentMatch.firstDiffGroupIndex
      });
      targetMatchResult.similars.push(pickedSimilar);
    }
  }

  return {
    similars: similarsSort(targetMatchResult.similars),
    matches: targetMatchResult.matches
  };
}; // 剔除线程
// ([a,b,c,a,e,b], [a, b])

var removeIngoreThreads = function removeIngoreThreads(userBlockTrees, ignoreThreads) {
  var newUserBlockTrees = userBlockTrees.filter(function (xblock) {
    if (Array.isArray(xblock)) {
      xblock = xblock[0];
    }

    var ignoreThread = ignoreThreads.find(function (it) {
      return it.type === xblock.type;
    }); // quick out

    if (!ignoreThread) {
      return true;
    }

    var xString = getFlattenTree(xblock).map(function (item) {
      return item.type;
    }).join('');
    var ignoreString = getFlattenTree(ignoreThread).map(function (item) {
      return item.type;
    }).join('');

    if (xString === ignoreString) {
      // 只剔除一个线程，避免过度剔除
      ignoreThreads = ignoreThreads.filter(function (it) {
        return it.id != ignoreThread.id;
      });
      return false;
    } else {
      return true;
    }
  });
  return newUserBlockTrees;
}; // 快速排序：根据线程堆中积木数目排序
// export const quickSort = (blockTrees: Block[]) => {
//     if (blockTrees.length < 2) {
//         return blockTrees;
//     }
//     return blockTrees.sort((aTree, bTree) => {
//         const a = getFlattenTree(aTree).length;
//         const b = getFlattenTree(bTree).length;
//         return b - a;
//     });
// };
// 特别：为减少用户调试成本，对等长树，基于其第一个积木的参数，做一个排序。

var sortByTopNode = function sortByTopNode(trees) {
  if (trees.length < 2) {
    return trees;
  }

  return trees.sort(function (aTree, bTree) {
    var aLen = aTree.length;
    var bLen = bTree.length; // 优先按积木数排序

    if (bLen - aLen !== 0) {
      return bLen - aLen;
    } else {
      // 其次按首积木 type 排序
      var aType = aTree[0].type;
      var bType = bTree[0].type;
      var typeDiff = mapDiffStr2Axis(aType, bType);

      if (typeDiff !== 0) {
        return typeDiff;
      } else {
        // 再次按照首积木参数值排序
        var aArg = getBlockArgSortFlag(aTree[0]);
        var bArg = getBlockArgSortFlag(bTree[0]);
        var argDiff = mapDiffStr2Axis(aArg, bArg);
        return argDiff;
      }
    }
  });
};

var createGeneralMsg = function createGeneralMsg(result, errorType) {
  if (result === void 0) {
    result = true;
  }

  if (errorType === void 0) {
    errorType = ERROR_TYPE.NO_ERROR;
  }

  var others = [];

  for (var _i = 2; _i < arguments.length; _i++) {
    others[_i - 2] = arguments[_i];
  }

  var msg = typeof errorType === 'number' ? createCoreMsg({
    errorType: errorType
  }) : errorType;
  return __assign({
    result: result,
    msg: msg
  }, others);
}; // assert 主要消息

var createCoreMsg = function createCoreMsg(coreMsg, isTiny) {
  if (isTiny === void 0) {
    isTiny = false;
  }

  var received = coreMsg.received,
      expected = coreMsg.expected,
      expectAt = coreMsg.expectAt,
      errorType = coreMsg.errorType,
      fieldMsg = coreMsg.fieldMsg;

  if (isTiny) {
    received = getTinyBlock(received);
    expected = getTinyBlock(expected);

    for (var key in expectAt) {
      expectAt[key] = getTinyWithin(expectAt[key]);
    }
  }

  return {
    actual: received || null,
    expect: expected || null,
    expectAt: expectAt || {},
    fieldMsg: fieldMsg,
    errorType: errorType || ERROR_TYPE.NO_ERROR
  };
};

var assertAgrs = function assertAgrs(similarRank, ignoreArgs) {
  // 多线程相同帽子块问题：经过推理，对于主积木相同的若干个线程，需要重新进行 similar 排序
  // const newSimilarRank = similarRank;
  for (var _i = 0, similarRank_1 = similarRank; _i < similarRank_1.length; _i++) {
    var picked = similarRank_1[_i];
    var _a = picked.refer,
        targetTree = _a.targetTree,
        sourceTree = _a.sourceTree;
    var argsComparedDiff = getEqualQueueArgsCompared(targetTree, sourceTree, ignoreArgs);

    if (argsComparedDiff) {
      var fieldMsg = argsComparedDiff.fieldMsg,
          expectAt = argsComparedDiff.expectAt,
          which = argsComparedDiff.which,
          argErrorType = argsComparedDiff.argErrorType;
      var expected = targetTree[which];
      var received = sourceTree[which];
      var coreMsg = createCoreMsg({
        received: received,
        expected: expected,
        fieldMsg: fieldMsg,
        errorType: argErrorType,
        expectAt: {
          within: expectAt
        }
      }, true);
      return createGeneralMsg(false, coreMsg // stats: picked.rate
      );
    }
  }

  return createGeneralMsg(true, ERROR_TYPE.NO_ERROR);
}; // 参数判定 plus
// 对于所有匹配路径，只要有一条 matchestPath 参数匹配是通过的，则宣告结束
// 对于每条匹配路径 matchestPath，则遍历匹配项，进行参数判定


var assertAgrsPlus = function assertAgrsPlus(allMatchest, ignoreArgs) {
  var assertFailResult = {};

  for (var _i = 0, allMatchest_1 = allMatchest; _i < allMatchest_1.length; _i++) {
    var matchestPath = allMatchest_1[_i];
    var isPass = true;
    var matchedMap = SimilarAnalysis$1.getMatchedMap(matchestPath.split(','));

    for (var _a = 0, matchedMap_1 = matchedMap; _a < matchedMap_1.length; _a++) {
      var similars = matchedMap_1[_a];
      var assertResult = assertAgrs(similars, ignoreArgs);

      if (!assertResult.result) {
        if (typeof assertFailResult.result !== 'boolean') {
          assertFailResult = assertResult;
        }

        isPass = false;
        break;
      }
    } // 未成功继续，成功即结束


    if (isPass) {
      assertFailResult = {};
      break;
    }
  }

  return assertFailResult;
}; // 唯一解特性: 必然有序


var assertUnique = function assertUnique(userBlockTrees, expectBlockTrees, ignoreArgs) {
  var len = expectBlockTrees.length; // 线程数

  var xLen = userBlockTrees.length; // 线程数
  // user tree 缺失线程或者多出线程, 就是缺失线程, 必然不通过判定
  // 所以只需要关注主干 block 层面, 无需关注到参数判定

  if (len > xLen) {
    var similarRank = getDeepTreeSimilarRank(expectBlockTrees, userBlockTrees, true);
    var coreMsg = createCoreMsg({
      errorType: ERROR_TYPE.BLOCK_MISSING
    });
    var matchedThreads = getEqualSimilars(similarRank); // todo 去重
    // 对于完全匹配的一对线程，应当移除 similarRank 仍被误占的线程
    // 如果刚正确匹配完 user tree，则错误直接指向 UnmatchedExpect 缺失线程

    if (matchedThreads.length === xLen) {
      var lostThread = getUnmatchedExpectThread(expectBlockTrees, matchedThreads);
      coreMsg.expect = getTinyBlock(lostThread);
      coreMsg.expectAt.thread = null;
      coreMsg.errorType = ERROR_TYPE.THREAD_MISSING;
    } else {
      // 剔除已匹配过的 user 线程
      // 必然有未完全匹配的 user 线程，作为锚点
      var picked = getUnoccupiedSourceThread(similarRank, matchedThreads); // 完全不等或部分相等，定位均指向本线程

      var compared = compareEqualQueueBase(picked);
      coreMsg.expect = getTinyBlock(compared.expected);
      coreMsg.actual = getTinyBlock(compared.received);
      coreMsg.errorType = compared.errorType;
      coreMsg.expectAt = compared.expectAt;
    }

    return {
      result: false,
      msg: coreMsg
    };
  } // 多出 top 积木，就是多出线程
  else if (len < xLen) {
      var similarRank = getDeepTreeSimilarRank(expectBlockTrees, userBlockTrees, true);
      var coreMsg = createCoreMsg({
        errorType: ERROR_TYPE.BLOCK_EXCEEDED
      });
      var matchedThreads = getEqualSimilars(similarRank); // 如果刚好匹配完 expect tree，则错误直接指向多出的 user 线程

      if (matchedThreads.length === len) {
        var extraThread = getUnoccupiedSourceThread(similarRank, matchedThreads);
        coreMsg.actual = getTinyBlock(extraThread);
        coreMsg.expectAt.thread = getTinyBlock(extraThread);
        coreMsg.errorType = ERROR_TYPE.THREAD_EXCEEDED;
      } else {
        // matchedThreads.length < len
        var picked = getUnoccupiedSourceThread(similarRank, matchedThreads);
        var compared = compareEqualQueueBase(picked);
        coreMsg.expect = getTinyBlock(compared.expected);
        coreMsg.actual = getTinyBlock(compared.received);
        coreMsg.errorType = compared.errorType;
        coreMsg.expectAt = compared.expectAt;
      }

      return {
        result: false,
        msg: coreMsg // stats: picked.rate // todo !picked

      };
    } else {
      // const expectSortedTree = quickSort(expectBlockTrees as Block[]);
      // const expectSortedTree = quickSort(expectBlockTrees as Block[]);
      // 按相似度进行排序进行比对
      var similarRank = getDeepTreeSimilarRank(expectBlockTrees, userBlockTrees, true); // 匹配的线程

      var matchedThreads = getEqualSimilars(similarRank);

      if (matchedThreads.length < len) {
        // 从匹配的线程剔除占用的线程
        // 必然有未完全匹配的 user 线程，作为锚点
        var picked = getUnoccupiedSourceThread(similarRank, matchedThreads); // picked 存在！

        var compared = compareEqualQueueBase(picked);
        var expected = compared.expected,
            received = compared.received,
            errorType = compared.errorType,
            expectAt = compared.expectAt;
        var coreMsg = createCoreMsg({
          expected: expected,
          received: received,
          errorType: errorType,
          expectAt: expectAt
        }, true);
        return createGeneralMsg(false, coreMsg // stats: picked.rate
        );
      } // 假如所有主干都通过 rate = 1，考察参数是否通过判定


      return assertAgrs(matchedThreads, ignoreArgs);
    }
}; // 包含是指: expectTree 是 userTree 的子集, 且 userTree 线程数不少于 expectTree 线程数


var assertContain = function assertContain(userBlockTrees, expectBlockTrees, judgeList, ignoreArgs) {
  SimilarAnalysis$1.reset();
  var treeLen = expectBlockTrees.length; // 线程数

  var sourceAllFlattens = getFlattenForest(userBlockTrees);

  for (var i = 0; i < treeLen; i++) {
    var expectDeepTree = toArray(expectBlockTrees[i]);
    var matchResult = matchGroupFlatTree(expectDeepTree, sourceAllFlattens, judgeList[i] === THREAD_FLAG_TYPE.ORDER, i); // 将匹配上的线程加入分析、去重
    // matched.length = 0 不能直接拿它此时的 expectDeepTree 作为终止结果
    // 因为后续匹配中，仍然可能有其他 expectDeepTree_x 匹配成功，
    // 这样会缩减 expectDeepTree 未匹配时的相似匹配项目
    // 因为我想拿到最终的相似项目，是最小破坏性的

    SimilarAnalysis$1.add(i, matchResult); // matched.length > 0 or matched.length = 0
  }

  var allMatchest = SimilarAnalysis$1.getMatchest(); // 检查所有最匹配集合中是否有未被匹配的 expect 线程

  if (SimilarAnalysis$1.checkLost(allMatchest)) {
    var _a = SimilarAnalysis$1.getLostAndMatched(allMatchest),
        lostIndex = _a.lostIndex,
        matchThreads = _a.matchThreads;

    var topSimilar = SimilarAnalysis$1.getTopSimilar(lostIndex, matchThreads);

    if (!topSimilar) {
      var expectBlock = SimilarAnalysis$1.getTopPice(lostIndex, expectBlockTrees);
      var coreMsg_1 = createCoreMsg({
        expected: getTinyBlock(expectBlock),
        errorType: ERROR_TYPE.THREAD_MISSING,
        expectAt: {
          thread: null
        }
      }); // 包含解只存在线程缺失，不存在线程多出

      return createGeneralMsg(false, coreMsg_1 // stats: picked.rate
      );
    }

    var compared = compareEqualQueueBase(topSimilar);
    var expected = compared.expected,
        received = compared.received,
        errorType = compared.errorType,
        expectAt = compared.expectAt;
    var coreMsg = createCoreMsg({
      expected: expected,
      errorType: errorType,
      received: received,
      expectAt: expectAt
    }, true);
    return createGeneralMsg(false, coreMsg // stats: picked.rate
    );
  } // 只有完全匹配了，我们再来进行参数判定，因为参数较于积木，处于次要位置


  var assertFailResult = assertAgrsPlus(allMatchest, ignoreArgs);

  if (typeof assertFailResult.result === 'boolean') {
    return assertFailResult;
  }

  return createGeneralMsg(true, ERROR_TYPE.NO_ERROR);
}; // 不判定


var assertSkip = function assertSkip() {
  return createGeneralMsg(true, ERROR_TYPE.NO_ERROR);
}; // 解析 ExpectInputs


var parseInputs = function parseInputs(expectInputs, userInput, isUnique) {
  return __awaiter(void 0, void 0, void 0, function () {
    var expectTrees, judgeList, ignoreThread, _i, expectInputs_1, expectInput, thread, order, block_1, block, userBlockTrees;

    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          expectTrees = [];
          judgeList = [];
          ignoreThread = [];
          _i = 0, expectInputs_1 = expectInputs;
          _a.label = 1;

        case 1:
          if (!(_i < expectInputs_1.length)) return [3
          /*break*/
          , 4];
          expectInput = expectInputs_1[_i];
          thread = expectInput.thread, order = expectInput.order;
          return [4
          /*yield*/
          , getStreamTree(thread)];

        case 2:
          block_1 = _a.sent().block;

          if (order === THREAD_FLAG_TYPE.INGORE) {
            // 业务规定：不存在组合被跳过的情况，即跳过的一定是一个整体连接的积木
            // must be [abc], not be [ab,cd]
            if (block_1.length > 1) {
              throw new Error('Thread ignored should be a whole connected blocks');
            }

            ignoreThread.push(block_1[0]);
          } else {
            // 唯一 & 有序 [abc]
            if (isUnique) {
              if (block_1.length > 1) {
                throw new Error('Thread unique should be a whole connected blocks');
              }

              expectTrees.push(block_1[0]);
            } else {
              // 包含 & 有序|无序 [a,b,c], [abc]
              expectTrees.push(block_1);
            }

            judgeList.push(order);
          }

          _a.label = 3;

        case 3:
          _i++;
          return [3
          /*break*/
          , 1];

        case 4:
          return [4
          /*yield*/
          , getStreamTree(userInput)];

        case 5:
          block = _a.sent().block;
          userBlockTrees = removeIngoreThreads(block, ignoreThread);
          return [2
          /*return*/
          , {
            expectTrees: expectTrees,
            judgeList: judgeList,
            userBlockTrees: userBlockTrees
          }];
      }
    });
  });
}; // 判定入口 main 函数

var mainAssert = function mainAssert(expectInputs, userInput, rule) {
  return __awaiter(void 0, void 0, void 0, function () {
    var flag, ignoreArgs, _a, error, expectTrees, judgeList, userBlockTrees;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          flag = rule.flag, ignoreArgs = rule.ignoreArgs; // 不判定，直接以正确结束

          if (flag === FLAG_TYPE.SKIP) {
            return [2
            /*return*/
            , assertSkip()];
          }

          return [4
          /*yield*/
          , parseInputs(expectInputs, userInput, flag === FLAG_TYPE.UNIQUE).catch(function (err) {
            console.error(err);
            return {
              error: err,
              expectTrees: [],
              judgeList: [],
              userBlockTrees: []
            };
          })];

        case 1:
          _a = _b.sent(), error = _a.error, expectTrees = _a.expectTrees, judgeList = _a.judgeList, userBlockTrees = _a.userBlockTrees; // 课程数据配置不合法

          if (error) {
            return [2
            /*return*/
            , createGeneralMsg(false, ERROR_TYPE.ILLEGAL_CONFIG_ERROR)];
          } // 配置数据空线程


          if (expectTrees.length === 0) {
            return [2
            /*return*/
            , createGeneralMsg(false, ERROR_TYPE.EXPECT_ASSERT_DATA_EMPTY)];
          } // 用户数据空线程，
          // todo 可能无积木，可能是被跳过积木给剔掉了


          if (userBlockTrees.length === 0) {
            return [2
            /*return*/
            , createGeneralMsg(false, ERROR_TYPE.USER_ASSERT_DATA_EMPTY)];
          }

          if (flag === FLAG_TYPE.UNIQUE) {
            return [2
            /*return*/
            , assertUnique(userBlockTrees, expectTrees, ignoreArgs)];
          } else if (flag === FLAG_TYPE.CONTAIN) {
            return [2
            /*return*/
            , assertContain(userBlockTrees, expectTrees, judgeList, ignoreArgs)];
          } // 暂不支持这种判定类型 flag=${flag};


          return [2
          /*return*/
          , createGeneralMsg(false, ERROR_TYPE.MINETYPE_NOT_SUPPORT)];
      }
    });
  });
};

var assertContentType = function assertContentType(_mimeType, expected, userInput) {
  var coupleChecker = getTypeChecker(_mimeType);

  if (!coupleChecker) {
    return createGeneralMsg(false, ERROR_TYPE.MINETYPE_NOT_SUPPORT); // 数据格式校验失败
  }

  var checkUserInput = coupleChecker.checkUserInput,
      checkExpectInput = coupleChecker.checkExpectInput;
  var isUserInputValid = checkUserInput(userInput);
  var isExpectedValid = checkExpectInput(expected);

  if (isUserInputValid === undefined) {
    return createGeneralMsg(false, ERROR_TYPE.USERINPUT_EMPTY); // userInput 输入为空
  } else if (!isUserInputValid) {
    return createGeneralMsg(false, ERROR_TYPE.USERINPUT_INVALID); // 数据格式校验失败
  }

  if (isExpectedValid === undefined) {
    return createGeneralMsg(false, ERROR_TYPE.EXPECT_CONFIG_EMPTY); // expected 配置为空
  } else if (!isExpectedValid) {
    return createGeneralMsg(false, ERROR_TYPE.EXPECT_INVALID); // 数据格式校验失败
  }

  return createGeneralMsg(true, ERROR_TYPE.NO_ERROR);
};

var StaticXmlEngine =
/** @class */
function () {
  function StaticXmlEngine() {
    this._mimeType = MIME_TYPE.XML; // 固定的

    this.rule = {
      flag: FLAG_TYPE.UNIQUE,
      ignoreArgs: {}
    };
  } // 需设置 flag


  StaticXmlEngine.prototype.setConfig = function (config) {
    this.rule.flag = config.flag;
  };
  /**
   * 静态判定入口
   * @param {*} userInput
   * @param {String|Array.String} expected
   * @returns {Object.boolean} result boolean
   * @returns {Object.Object} msg boolean
   */


  StaticXmlEngine.prototype.assert = function (expected, userInput, ignoreArgs) {
    return __awaiter(this, void 0, void 0, function () {
      var isTypeObj, result, _loop_1, this_1, _i, expected_1, expInput, state_1;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            expected = toArray(expected);
            isTypeObj = assertContentType(this._mimeType, expected, userInput);

            if (!isTypeObj.result) {
              return [2
              /*return*/
              , isTypeObj];
            }

            this.rule.ignoreArgs = ignoreArgs || {};
            result = undefined;

            _loop_1 = function _loop_1(expInput) {
              var res;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4
                    /*yield*/
                    , mainAssert(expInput, userInput, this_1.rule).catch(function (err) {
                      console.error(err, expInput);
                      return createGeneralMsg(false, ERROR_TYPE.UNKOWN_ERROR);
                    })];

                  case 1:
                    res = _a.sent();

                    if (res.result) {
                      return [2
                      /*return*/
                      , {
                        value: res
                      }];
                    } else {
                      result = result || res;
                      return [2
                      /*return*/
                      , "continue"];
                    }
                }
              });
            };

            this_1 = this;
            _i = 0, expected_1 = expected;
            _a.label = 1;

          case 1:
            if (!(_i < expected_1.length)) return [3
            /*break*/
            , 4];
            expInput = expected_1[_i];
            return [5
            /*yield**/
            , _loop_1(expInput)];

          case 2:
            state_1 = _a.sent();
            if (typeof state_1 === "object") return [2
            /*return*/
            , state_1.value];
            _a.label = 3;

          case 3:
            _i++;
            return [3
            /*break*/
            , 1];

          case 4:
            return [2
            /*return*/
            , result];
        }
      });
    });
  };

  return StaticXmlEngine;
}();

var MaxExecCount = 100000;
var XLoopers = ['control_repeat_until', 'control_wait_until', 'control_repeat', 'control_forever'];

var isMainBlock = function isMainBlock(block, ops) {
  var len = ops.length;

  if (len > 0) {
    return block.id === ops[len - 1].id;
  } else {
    return true;
  }
}; // 线程重运行时，首积木是以下两种积木的，需分别对待：
// 1、绿旗、所有帽子积木，任何非循环块 —— 这类积木的反复触发，我希望前面的记录被后一次执行覆盖掉
// 2、循环块 - 这类积木，却不要用后一次记录擦除前边的记录
// todo 但如果是鼠标点击的话，循环块也应该擦除


var isThreadReboot = function isThreadReboot(block, topId) {
  var topBlockIsTicked = block.id === topId;
  var notLooper = !XLoopers.includes(block.opcode);
  return topBlockIsTicked && notLooper;
};

var JsCapturer =
/** @class */
function () {
  function JsCapturer(opts) {
    this.threads = {};
    this.aliveThreads = [];
    this.actualOpcodes = [];
    this.expectOpcodes = opts.expectOpcodes || [];
    this.captureType = CAPTURE_TYPE.CLICK; // 抓 click

    this.asserter = opts.asserter || emptyFn;
  }

  JsCapturer.prototype.tick = function (block, thread, subOps) {
    if (!this.allowCapture(thread.stackClick)) {
      return;
    }

    var topId = thread.topBlock;

    if (!this.threads[topId] || isThreadReboot(block, topId)) {
      this.threads[topId] = [];
      this.aliveThreads.push(topId);
    } // case1 将主干积木 push 进去


    if (isMainBlock(block, subOps) && this.aliveThreads.includes(topId)) {
      var excuted = this.convert(block, subOps);
      this.push(topId, excuted);
    } // 记录已执行过的积木


    if (!this.actualOpcodes.includes(block.opcode)) {
      this.actualOpcodes.push(block.opcode);
    } // 加入线程执行次数超过阈值，则标记结束


    if (this.threads[topId].length > MaxExecCount) {
      this.aliveThreads = this.aliveThreads.filter(function (a) {
        return a !== topId;
      });
    }

    this.tryFinish();
  }; // todo 对于循环块生成的一大堆数据，并不希望 push 进来


  JsCapturer.prototype.push = function (topId, excuted) {
    var thisAllExecuteds = this.threads[topId];
    var prevExecuted = thisAllExecuteds[thisAllExecuteds.length - 1];

    if (prevExecuted && isObjectEqual(prevExecuted.block._argValues, excuted.block._argValues)) {
      prevExecuted.executeCount++;
    } else {
      this.threads[topId].push(excuted);
    }
  };

  JsCapturer.prototype.convert = function (block, subOps) {
    var opsLen = subOps.length;
    var args = opsLen > 1 ? subOps.slice(0, opsLen - 1) : [];
    var isXLooper = XLoopers.includes(block.opcode);
    var excuted = {
      block: block,
      isXLooper: isXLooper,
      executeCount: 1,
      args: args
    };
    return excuted;
  }; // todo 在调试过程中，会记录了一些临时数据，需清除掉


  JsCapturer.prototype.removeDead = function () {};
  /**
   * 分析循环，是否该结束了
   */


  JsCapturer.prototype.loopAnalysis = function () {}; // 估计已经满足判定条件，尝试开始判定 - 主要用来优化缩短正确判定的时间


  JsCapturer.prototype.tryFinish = function () {
    if (this.allowFromOpcodes()) {
      if (isFunction(this.asserter)) {
        this.asserter({
          type: DYNAMIC_JUDGE_CONDITINO.guessOk,
          data: this.getData()
        });
      }

      return;
    }

    if (this.allowFromAlive()) {
      if (isFunction(this.asserter)) {
        this.asserter({
          type: DYNAMIC_JUDGE_CONDITINO.loopEnd,
          data: this.getData()
        });
      }

      return;
    }
  };

  JsCapturer.prototype.allowFromOpcodes = function () {
    var _this = this;

    if (this.expectOpcodes.length > this.actualOpcodes.length) {
      return false;
    }

    var unBooteds = this.expectOpcodes.filter(function (expOp) {
      return !_this.actualOpcodes.includes(expOp);
    });
    return unBooteds.length === 0;
  };

  JsCapturer.prototype.allowFromAlive = function () {
    return this.aliveThreads.length > 0;
  }; // click: 2
  // notClick: 1


  JsCapturer.prototype.allowCapture = function (isClick) {
    if (isClick) {
      return this.captureType > CAPTURE_TYPE.NO_CLICK;
    } else {
      return true;
    }
  };

  JsCapturer.prototype.getData = function () {
    return this.threads;
  };

  JsCapturer.prototype.clear = function () {
    this.threads = {};
    this.aliveThreads = [];
    this.actualOpcodes = [];
    this.expectOpcodes = [];
  };

  JsCapturer.prototype.log = function () {
    console.log(this.threads);
  };

  return JsCapturer;
}();

/**
 * jsProcess 定义了动态判定的全流程，属于应用层代码
 *
 * 执行流的特征：
 * 1、参数积木会先于主积木而执行
 */

var JsProcess =
/** @class */
function () {
  function JsProcess() {
    this.vm = null;
    this.capture = this.capture.bind(this);
    this.evtRemovers = [];
    this.overtimer_ = null;
    this.processTime = 10000; // ms
  }

  JsProcess.prototype.setConfig = function (_a) {
    var vm = _a.vm,
        time = _a.time;
    this.vm = vm;
    this.processTime = time > 10 ? time * 1000 : this.processTime;
  }; // 动态判定进程
  // 1、线程 runEnd 时，emit 一个 finish 信号
  // 2、循环结束时，emit 一个 finish 信号
  // 3、主动结束时，emit 一个 finish 信号
  // 4、超时时，emit 一个 finish 信号


  JsProcess.prototype.open = function (asserter) {
    var _this = this;

    this.close();
    this.jsCapturer = new JsCapturer({
      asserter: asserter,
      expectOpcodes: []
    });
    var remover1 = this.onExecute(this.capture, false); // 线程结束触发

    var remover2 = this.onThreadEnd(function (opts) {
      return asserter({
        type: DYNAMIC_JUDGE_CONDITINO.threadEnd,
        opts: opts,
        data: _this.jsCapturer.getData()
      });
    }, false);
    this.evtRemovers.push(remover1, remover2); // 超时触发

    this.overtimer_ = setTimeout(function () {
      asserter({
        type: DYNAMIC_JUDGE_CONDITINO.overtime,
        data: _this.jsCapturer.getData()
      });
    }, this.processTime);
  }; // 关闭判定进程
  // 调 open() 再次开启


  JsProcess.prototype.close = function () {
    this.jsCapturer = null;
    this.evtRemovers.forEach(function (remove) {
      return remove();
    });
    this.evtRemovers = [];
    clearTimeout(this.overtimer_);
    this.overtimer_ = null;
  }; // todo 强制判定，用于中间过程中用户主动获得一次判定结果


  JsProcess.prototype.forceAssert = function () {}; // 监听执行流


  JsProcess.prototype.onExecute = function (handler, isOnce) {
    var _this = this;

    if (isOnce) {
      this.vm.once('REPORT_EXCUTE', handler);
      return emptyFn;
    } else {
      this.vm.addListener('REPORT_EXCUTE', handler);
      return function () {
        return _this.vm.removeListener('REPORT_EXCUTE', handler);
      };
    }
  }; // 线程运行终止


  JsProcess.prototype.onThreadEnd = function (handler, isOnce) {
    var _this = this;

    if (isOnce) {
      this.vm.once('SCRIPT_GLOW_OFF', handler);
      return emptyFn;
    } else {
      this.vm.addListener('SCRIPT_GLOW_OFF', handler);
      return function () {
        return _this.vm.removeListener('SCRIPT_GLOW_OFF', handler);
      };
    }
  };

  JsProcess.prototype.capture = function (execData) {
    var opCached = execData.opCached,
        thread = execData.thread,
        subOps = execData.subOps;
    this.jsCapturer.tick(opCached, thread, subOps);
  };

  return JsProcess;
}();

var JsDynamicEngine =
/** @class */
function () {
  function JsDynamicEngine() {
    this._mimeType = MIME_TYPE.JSDYNAMIC; // 固定的

    this.rule = {
      flag: FLAG_TYPE.UNIQUE,
      ignoreArgs: {},
      advance: {}
    };
    this.jsProcess = new JsProcess();
  }

  JsDynamicEngine.prototype.setConfig = function (config) {
    var flag = config.flag,
        rest = __rest(config, ["flag"]);

    this.rule.flag = flag;
    this.jsProcess.setConfig(rest);
  };

  JsDynamicEngine.prototype.assert = function (expected, userInput, ignoreArgs) {
    var _this = this;

    var isTypeObj = assertContentType(this._mimeType, expected, userInput);

    if (!isTypeObj.result) {
      return Promise.resolve(isTypeObj);
    }

    this.rule.ignoreArgs = ignoreArgs || {}; // let result = undefined as AssertMsg;

    return new Promise(function (resolve) {
      _this.jsProcess.open(resolve);
    }).then(function (data) {
      // todo tips
      var type = data.type;

      console.warn(data);
      return {};
    });
  };

  JsDynamicEngine.prototype.abort = function () {
    this.jsProcess.close();
  };

  return JsDynamicEngine;
}();

var DefaultErrorEngine =
/** @class */
function () {
  function DefaultErrorEngine() {}

  DefaultErrorEngine.prototype.setConfig = function () {// todo nothing
  };

  DefaultErrorEngine.prototype.assert = function (mimeType) {
    mimeTypeWarn(mimeType);
    var msg = createGeneralMsg(false, ERROR_TYPE.MINETYPE_NOT_SUPPORT);
    return Promise.resolve(msg);
  };

  return DefaultErrorEngine;
}();

var getDriver = function getDriver(mimeType) {
  switch (mimeType) {
    case MIME_TYPE.XML:
      return StaticXmlEngine;

    case MIME_TYPE.JSDYNAMIC:
      return JsDynamicEngine;

    default:
      return DefaultErrorEngine;
  }
};

/**
 * @fileOverview AssertEngine Class
 * @author Jeremy
 */

var AssertEngine =
/** @class */
function () {
  function AssertEngine() {
    this.rule = {
      flag: 1,
      ignoreArgs: {}
    };
    this.mimeType = MIME_TYPE.XML;
    this.flag = FLAG_TYPE.UNIQUE;
    this.engine = null;
  }
  /**
   * 每次判定需调用此初始化
   * @param {Object.string|Object.number} flag 判定目标
   * @param {Object.string} mimeType 数据类型
   */


  AssertEngine.prototype.setConfig = function (_a) {
    var _b = _a === void 0 ? {} : _a,
        flag = _b.flag,
        mimeType = _b.mimeType;

    if (!getFlagChecked(flag)) {
      flag = FLAG_TYPE.UNIQUE;
    }

    if (!getTypeChecked(mimeType)) {
      mimeType = MIME_TYPE.XML;
    }

    this.rule.flag = flag;
    this.mimeType = mimeType;
    this.flag = flag;
  };

  AssertEngine.prototype.assert = function (expected, userInput, ignoreArgs) {
    var engine = this.getDriver(this.mimeType);
    engine.setConfig({
      flag: this.flag
    }); // vm?

    return engine.assert(expected, userInput, ignoreArgs);
  }; // 对于动态判断，那些耗时较长的判断，可放弃


  AssertEngine.prototype.abort = function () {
    if (this.engine && this.engine.abort) {
      this.engine.abort();
    }
  };

  AssertEngine.prototype.getDriver = function (mimeType) {
    var Driver = getDriver(mimeType);

    if (this.engine instanceof Driver) {
      return this.engine;
    } else {
      this.engine = new Driver();
      return this.engine;
    }
  };

  AssertEngine.getStreamTree = getStreamTree;
  return AssertEngine;
}();
// import './utils/mock';
// window.AssertEngine = AssertEngine;
// #endif

export default AssertEngine;
