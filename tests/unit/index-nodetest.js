/* jshint node: true */
/* jshint jasmine: true */
'use strict';
var assert = require('chai').assert;

var stubProject = {
  name: function(){
    return 'my-project';
  }
};

describe('base plugin', function() {
  var Subject, mockUi;

  beforeEach(function() {
    Subject = require('../../index');
    mockUi = {
      verbose: false,
      messages: [],
      write: function() {
      },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    var plugin = new Subject({
      name: 'test-plugin',
    });

    assert.equal(plugin.name, 'test-plugin');
  });

  describe('log', function() {

    it('logs raw', function() {
      var plugin = new Subject({
        name: 'test-plugin',
        ui: mockUi
      });
      plugin.logRaw('foo');
      assert.deepEqual(mockUi.messages, ['foo']);
    });

    it('logs with default blue color', function() {
      var plugin = new Subject({
        name: 'test-plugin',
        ui: mockUi
      });
      plugin.log('foo');
      assert.deepEqual(mockUi.messages, ['\u001b[34m- foo\u001b[39m']);
    });

    it('logs verbose', function() {
      var verboseUi = {
        verbose: true,
        messages: [],
        write: function(message) {
          this.messages.push(message);
        },
        writeLine: function() {
        }
      };
      var plugin = new Subject({
        name: 'test-plugin',
        ui: verboseUi
      });
      plugin.log('foo', {verbose: true});
      assert.deepEqual(verboseUi.messages, ['\u001b[34m|    \u001b[39m']);
    });
  });

  describe('plugin helper', function() {
    it('provides access to the oringal default values', function() {
      var Plugin = Subject.extend({
        requiredConfig: ['bar'],
        defaultConfig: {
          foo: function(context) {
            return context.foo;
          }
        }
      });

      var plugin = new Plugin({
        name: 'blah'
      });

      var context = {
        foo: 'foo',
        config: {
          blah: {
            foo: function(context, pluginHelper) {
              return pluginHelper.readConfigDefault('foo') + 'foo';
            },
            bar: function(context, pluginHelper) {
              return pluginHelper.readConfigDefault('bar') + 'bar';
            }
          }
        }
      };

      plugin.beforeHook(context);
      assert.equal(plugin.readConfig('foo'), 'foofoo');
      assert.equal(plugin.readConfig('bar'), 'undefinedbar');
    });

    it('allows the implementer to add things to the pluginHelper', function() {
      var Plugin = Subject.extend({
        defaultConfig: { foo: 'foo' }
      });

      var plugin = new Plugin({
        name: 'blah',

        pluginHelper: function(context) {
          return { bar: context.foo };
        }
      });

      var context = {
        foo: 'bar',
        config: {
          blah: {
            foo: function(context, pluginHelper) {
              return pluginHelper.readConfigDefault('foo') + pluginHelper.bar;
            }
          }
        }
      };

      plugin.beforeHook(context);
      assert.equal(plugin.readConfig('foo'), 'foobar');
    });
  });
});
