(function (window) {
  function Leo(selector) {
    return new Leo.prototype.init(selector);
  }

  Leo.prototype = {
    constructor: Leo,
    //version
    Leo: "1.0.0",
    //default length of the Leo obj
    length: 0,
    //default selector value
    selector: "",
    /**
     * use [] to find the push method
     * [].push == [].push.apply(this)
     */
    push: [].push,
    sort: [].sort,
    splice: [].splice,

    //pseudo => real
    toArray: function () {
      return [].slice.call(this);
    },

    get: function (num) {
      //no arg equals to use toArray()
      if (arguments.length === 0) {
        return this.toArray();
      } else if (num >= 0) {
        return this[num];
      } else {
        return this[this.length + num];
      }
    },

    eq: function (num) {
      //no arg return a blank Leo obj
      if (arguments.length === 0) {
        return new Leo();
      } else {
        return Leo(this.get(num));
      }
    },

    first: function () {
      return this.eq(0);
    },
    last: function () {
      return this.eq(-1);
    },

    each: function (callback) {
      return Leo.each(this, callback);
    },
    //test: 'jj',
    init: function (selector) {
      // 1. null, false, undefined, NaN...
      if (!selector) {
        //console.log(this.test)//this is the Leo.prototype
        return this;
      }

      // 2. String (code)
      else if (Leo.isString(selector)) {
        //remove the space
        selector = Leo.trim(selector);

        if (Leo.isHTML(selector)) {
          let temp = document.createElement("div");

          temp.innerHTML = selector;

          // for (let i = 0; i < temp.children.length; i++) {
          // 	this[i] = temp.children[i];
          // }
          // this.length = temp.children.length;

          /**
           * 1. change the this of the [] into
           * the this of this(first arg of apply(), namely Leo)
           * 2. can see it as a way change the real array into a pseudo array
           * 3. real => pseudo : [].push.apply(obj, arr)
           * 4. pseudo => real: arr = [].slice.call(obj)
           */
          [].push.apply(this, temp.children);

          //return this;
        }

        //when it is a real selector
        else {
          let ret = document.querySelectorAll(selector);

          [].push.apply(this, ret);

          //return this;
        }
      }

      // 3. array or obj
      else if (Leo.isArray(selector)) {
        // //real array
        // if (({}).toString.apply(selector) === '[object Array]') {
        // 	[].push.apply(this, selector);
        // 	return this;
        // }
        // //pseudo array
        // else {
        // 	let  temp = [].slice.call(selector);// p => r
        // 	[].push.apply(this, temp);//r => p
        // 	return this;
        // }

        let temp = [].slice.call(selector); // p => r
        [].push.apply(this, temp); //r => p
        //return this;
      } else if (Leo.isFunction(selector)) {
        // console.log('is function')

        Leo.ready(selector);
      }

      //other types
      else {
        this[0] = selector;
        this.length = 1;
      }

      return this;
    },
  };

  Leo.extend = Leo.prototype.extend = function (obj) {
    /**
     * Leo.extend: the this is the class Leo
     * Leo.prototype.extend: the this is the instance of the Leo
     * Thus we can use Leo.extend();
     * and leo.extend(); (leo = new Leo())
     */
    for (const key in obj) {
      //just like Leo.key / leo.key = obj.key
      this[key] = obj[key];
    }
  };

  /***static functions (class use) utils****/
  Leo.extend({
    isString: function (str) {
      return typeof str === "string";
    },

    isHTML: function (str) {
      return (
        str.charAt(0) === "<" &&
        str.charAt(str.length - 1) === ">" &&
        str.length >= 3
      );
    },

    isObject: function (ele) {
      return typeof ele === "object";
    },

    isWindow: function (ele) {
      return ele === window;
    },

    isArray: function (ele) {
      if (Leo.isObject(ele) && !Leo.isWindow(ele) && "length" in ele) {
        return true;
      }
      return false;
    },

    isFunction: function (ele) {
      return typeof ele === "function";
    },

    ready: function (fn) {
      if (document.readyState == "complete") {
        fn();
      } else if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", () => fn());
      } else {
        document.attachEvent("onreadystatechange", function () {
          if (document.readyState == "complete") {
            fn();
          }
        });
      }
    },

    /**
     * remove the space at the beginning and end of the str
     * leave the space between the str
     */
    trim: function (str) {
      //IE8 above
      if (str.trim) {
        return str.trim();
      } else {
        return str.replace(/^\s+ | \s+$/g, "");
      }
    },

    each: function (arg, callback) {
      if (Leo.isArray(arg)) {
        for (let i = 0; i < arg.length; i++) {
          let ret = callback.call(arg[i], i, arg[i]);

          if (ret === false) {
            break;
          } else if (ret === true) {
            continue;
          }
        }
      } else if (Leo.isObject(arg)) {
        for (const key in arg) {
          let ret = callback.call(arg[key], key, arg[key]);

          if (ret === false) {
            break;
          } else if (ret === true) {
            continue;
          }
        }
      }
      return arg;
    },

    map: function (arg, callback) {
      let ret = [];

      if (Leo.isArray(arg)) {
        for (let i = 0; i < arg.length; i++) {
          let temp = callback(arg[i], i);
          if (temp) ret.push(temp);
        }
      } else if (Leo.isObject(arg)) {
        for (const key in arg) {
          let temp = callback(arg[key], key);
          if (temp) ret.push(temp);
        }
      }
      return ret;
    },

    getStyle: function (dom, styleName) {
      if (window.getComputedStyle) {
        return window.getComputedStyle(dom)[styleName];
      } else {
        return dom.currentStyle[styleName];
      }
    },

    addEvent: function (dom, name, callBack) {
      if (dom.addEventListener) {
        dom.addEventListener(name, callBack);
      }
      //compatibility
      else {
        dom.attachEvent("on" + name, callBack);
      }
    },
  });

  /***********instance methods for node operations*********/
  Leo.prototype.extend({
    empty: function () {
      this.each(function (index, value) {
        this.innerHTML = "";
      });
      // for chain call...
      return this;
    },

    remove: function (sele) {
      if (arguments.length === 0) {
        this.each(function (index, value) {
          // console.log(this, value);
          this.parentNode.removeChild(this);
        });
      } else {
        // get all the elements with such selector
        L(sele).each((index, value) => {
          // get the tag name
          var type = value.tagName;

          // use the above tag name to match, if match then remove
          this.each(function (i, v) {
            if (type === v.tagName) {
              // the value is the above value
              value.parentNode.removeChild(value);
            }
          });
        });
      }
      return this;
    },

    html: function (content) {
      if (arguments.length === 0) {
        return this[0].innerHTML;
      } else {
        this.each(function (index, value) {
          value.innerHTML = content;
        });
        return this;
      }
    },

    text: function (content) {
      if (arguments.length === 0) {
        let ret = "";

        this.each(function (index, value) {
          ret += value.innerText;
        });
        return ret;
      } else {
        this.each(function (index, value) {
          this.innerText = content;
        });
        return this;
      }
    },

    // this(sons) is appended to sele(fathers)
    appendTo: function (sele) {
      let ret = [];

      L(sele).each((index, value) => {
        this.each(function (i, v) {
          if (index === 0) {
            value.appendChild(v);
            ret.push(v);
          } else {
            let cloneV = v.cloneNode(true);
            value.appendChild(cloneV);
            ret.push(cloneV);
          }
        });
      });
      return L(ret);
    },

    prependTo: function (sele) {
      let ret = [];

      L(sele).each((index, value) => {
        this.each(function (i, v) {
          if (index === 0) {
            value.insertBefore(v, value.firstChild);
            ret.push(v);
          } else {
            let cloneV = v.cloneNode(true);
            value.insertBefore(cloneV, value.firstChild);
            ret.push(cloneV);
          }
        });
      });
      return L(ret);
    },

    // sele(sons) is appended to this(fathers)
    append: function (sele) {
      if (Leo.isString(sele)) {
        // console.log('tt')
        this.get(0).innerHTML += sele;
      } else {
        // console.log('tt')
        L(sele).appendTo(this);
      }
      return this;
    },

    prepend: function (sele) {
      if (Leo.isString(sele)) {
        this.get(0).innerHTML = sele + this.get(0).innerHTML;
      } else {
        L(sele).prependTo(this);
      }
      return this;
    },

    // this is inseted before the sele starts
    insertBefore: function (sele) {
      let ret = [];

      L(sele).each((index, value) => {
        let partent = value.parentNode;

        this.each(function (i, v) {
          if (index === 0) {
            partent.insertBefore(v, value);
            ret.push(v);
          } else {
            let cloneV = v.cloneNode(true);
            partent.insertBefore(cloneV, value);
            ret.push(cloneV);
          }
        });
      });
      return L(ret);
    },

    //this is inseted after the sele ends
    insertAfter: function (sele) {
      let ret = [];

      L(sele).each((index, value) => {
        let partent = value.parentNode;
        let nextValue = value.nextSibling;

        this.each(function (i, v) {
          if (index === 0) {
            partent.insertBefore(v, nextValue);
            ret.push(v);
          } else {
            let cloneV = v.cloneNode(true);
            partent.insertBefore(cloneV, nextValue);
            ret.push(cloneV);
          }
        });
      });
      return L(ret);
    },

    // this replaces all the seles
    replaceAll: function (sele) {
      let ret = [];
      // insert the this before the seles
      L(sele).each((index, value) => {
        let parent = value.parentNode;

        this.each(function (i, v) {
          if (index === 0) {
            parent.insertBefore(v, value);
            L(value).remove();
            ret.push(v);
          } else {
            let cloneV = v.cloneNode(true);
            parent.insertBefore(cloneV, value);
            L(value).remove();
            ret.push(cloneV);
          }
        });
      });
      return L(ret);
    },
  });

  /***********instance methods for attribute operations*********/
  Leo.prototype.extend({
    // attr nodes
    attr: function (attr, value) {
      if (Leo.isString(attr)) {
        if (arguments.length === 1) {
          return this[0].getAttribute(attr);
        } else {
          this.each((index, val) => {
            val.setAttribute(attr, value);
          });
        }
      } else if (Leo.isObject(attr)) {
        for (const key in attr) {
          this.each((index, val) => {
            val.setAttribute(key, attr[key]);
          });
        }
      }
      return this;
    },

    // attrs
    prop: function (attr, value) {
      if (Leo.isString(attr)) {
        if (arguments.length === 1) {
          return this[0][attr];
        } else {
          this.each((index, val) => {
            val[attr] = value;
          });
        }
      } else if (Leo.isObject(attr)) {
        for (const key in attr) {
          this.each((index, val) => {
            val[key] = attr[key];
          });
        }
      }
      return this;
    },

    css: function (attr, value) {
      if (Leo.isString(attr)) {
        if (arguments.length === 1) {
          return Leo.getStyle(this[0], attr);
        } else {
          this.each((index, val) => {
            val.style[attr] = value;
          });
        }
      } else if (Leo.isObject(attr)) {
        for (const key in attr) {
          this.each((index, val) => {
            val.style[key] = attr[key];
          });
        }
      }
      return this;
    },

    val: function (content) {
      if (arguments.length === 0) {
        return this[0].value;
      } else {
        this.each((key, val) => {
          val.value = content;
        });
      }
      return this;
    },

    hasClass: function (name) {
      if (arguments === 0) {
        return false;
      } else {
        let flag = false;

        this.each((key, ele) => {
          let className = " " + ele.className + " ";

          if (className.indexOf(" " + name + " ") != -1) {
            flag = true;
            return false; //break
          }
        });
        return flag;
      }
    },

    addClass: function (names) {
      if (arguments.length === 0) return this;

      let nameArray = names.split(" ");

      this.each((key, ele) => {
        Leo.each(nameArray, (index, val) => {
          if (!Leo(ele).hasClass(val)) {
            ele.className += " " + val;
          }
        });
      });
      return this;
    },

    removeClass: function (names) {
      if (arguments.length === 0) {
        this.each((key, ele) => {
          ele.className = "";
        });
      } else {
        let nameArray = names.split(" ");

        this.each((key, ele) => {
          Leo.each(nameArray, (index, val) => {
            if (Leo(ele).hasClass(val)) {
              ele.className = (" " + ele.className + " ").replace(
                " " + val + " ",
                " "
              );
            }
          });
        });
      }
      return this;
    },

    toggleClass: function (names) {
      if (arguments.length === 0) {
        this.removeClass();
      } else {
        let nameArray = names.split(" ");

        this.each((key, ele) => {
          Leo.each(nameArray, (index, val) => {
            if (Leo(ele).hasClass(val)) {
              Leo(ele).removeClass(val);
            } else {
              Leo(ele).addClass(val);
            }
          });
        });
      }
      return this;
    },
  });

  /***********instance methods for events operations*********/
  Leo.prototype.extend({
    on: function (name, callBack) {
      this.each((key, ele) => {
        // 1. check if there is a cache for events
        if (!ele.eventCache) ele.eventCache = {}; // create a obj

        // 2. check if the attr(event type) exists
        if (!ele.eventCache[name]) {
          // 3. create a array for the same type of events
          ele.eventCache[name] = [];
          // 4. add the callBack into the corresponding array
          ele.eventCache[name].push(callBack);
          // 5. add the handle function for the same type events
          Leo.addEvent(ele, name, () => {
            // 6. traverse all the same type event methods
            // and carry out them in order
            Leo.each(ele.eventCache[name], (k, method) => {
              method(); // callBacks
            });
          });
        }
        // if already create the event type
        else {
          ele.eventCache[name].push(callBack);
        }
      });
    },

    off: function (name, method) {
      if (arguments.length === 0) {
        this.each((key, ele) => {
          ele.eventCache = {};
        });
      } else if (arguments.length === 1) {
        this.each((key, ele) => {
          ele.eventCache[name] = [];
        });
      } else if (arguments.length === 2) {
        this.each((key, ele) => {
          Leo.each(ele.eventCache[name], (index, meth) => {
            if (meth === method) {
              ele.eventCache[name].splice(index, 1);
            }
          });
        });
      }
    },

    clone: function (deep) {
      let ret = [];

      // deep copy
      if (deep) {
        this.each((key, ele) => {
          let cloneEle = ele.cloneNode(true);

          Leo.each(ele.eventCache, (event, array) => {
            Leo.each(array, (index, meth) => {
              Leo(cloneEle).on(event, meth);
            });
          });

          ret.push(cloneEle);
        });
      }
      // shallow copy
      else {
        this.each((key, ele) => {
          let cloneEle = ele.cloneNode(true);
          // console.log(cloneEle);
          ret.push(cloneEle);
        });
      }
      return Leo(ret);
    },
  });

  Leo.prototype.init.prototype = Leo.prototype;
  window.Leo = Leo;
  window.L = Leo;
})(window);
