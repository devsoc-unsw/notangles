// source: autotimetabler.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.AutoTimetableResponse', null, global);
goog.exportSymbol('proto.TimetableConstraints', null, global);
goog.exportSymbol('proto.TimetableConstraints.PeriodInfo', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.TimetableConstraints = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.TimetableConstraints.repeatedFields_, null);
};
goog.inherits(proto.TimetableConstraints, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.TimetableConstraints.displayName = 'proto.TimetableConstraints';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.TimetableConstraints.PeriodInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.TimetableConstraints.PeriodInfo.repeatedFields_, null);
};
goog.inherits(proto.TimetableConstraints.PeriodInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.TimetableConstraints.PeriodInfo.displayName = 'proto.TimetableConstraints.PeriodInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.AutoTimetableResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.AutoTimetableResponse.repeatedFields_, null);
};
goog.inherits(proto.AutoTimetableResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.AutoTimetableResponse.displayName = 'proto.AutoTimetableResponse';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.TimetableConstraints.repeatedFields_ = [6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.TimetableConstraints.prototype.toObject = function(opt_includeInstance) {
  return proto.TimetableConstraints.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.TimetableConstraints} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TimetableConstraints.toObject = function(includeInstance, msg) {
  var f, obj = {
    start: jspb.Message.getFieldWithDefault(msg, 1, 0),
    end: jspb.Message.getFieldWithDefault(msg, 2, 0),
    days: jspb.Message.getFieldWithDefault(msg, 3, ""),
    gap: jspb.Message.getFieldWithDefault(msg, 4, 0),
    maxdays: jspb.Message.getFieldWithDefault(msg, 5, 0),
    periodinfoList: jspb.Message.toObjectList(msg.getPeriodinfoList(),
    proto.TimetableConstraints.PeriodInfo.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.TimetableConstraints}
 */
proto.TimetableConstraints.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.TimetableConstraints;
  return proto.TimetableConstraints.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.TimetableConstraints} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.TimetableConstraints}
 */
proto.TimetableConstraints.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setStart(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setEnd(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDays(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setGap(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMaxdays(value);
      break;
    case 6:
      var value = new proto.TimetableConstraints.PeriodInfo;
      reader.readMessage(value,proto.TimetableConstraints.PeriodInfo.deserializeBinaryFromReader);
      msg.addPeriodinfo(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.TimetableConstraints.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.TimetableConstraints.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.TimetableConstraints} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TimetableConstraints.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStart();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getEnd();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getDays();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getGap();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getMaxdays();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getPeriodinfoList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.TimetableConstraints.PeriodInfo.serializeBinaryToWriter
    );
  }
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.TimetableConstraints.PeriodInfo.repeatedFields_ = [2,3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.TimetableConstraints.PeriodInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.TimetableConstraints.PeriodInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.TimetableConstraints.PeriodInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TimetableConstraints.PeriodInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    periodsperclass: jspb.Message.getFieldWithDefault(msg, 1, 0),
    periodtimesList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 2)) == null ? undefined : f,
    durationsList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 3)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.TimetableConstraints.PeriodInfo}
 */
proto.TimetableConstraints.PeriodInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.TimetableConstraints.PeriodInfo;
  return proto.TimetableConstraints.PeriodInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.TimetableConstraints.PeriodInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.TimetableConstraints.PeriodInfo}
 */
proto.TimetableConstraints.PeriodInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPeriodsperclass(value);
      break;
    case 2:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedFloat() : [reader.readFloat()]);
      for (var i = 0; i < values.length; i++) {
        msg.addPeriodtimes(values[i]);
      }
      break;
    case 3:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedFloat() : [reader.readFloat()]);
      for (var i = 0; i < values.length; i++) {
        msg.addDurations(values[i]);
      }
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.TimetableConstraints.PeriodInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.TimetableConstraints.PeriodInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.TimetableConstraints.PeriodInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.TimetableConstraints.PeriodInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPeriodsperclass();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getPeriodtimesList();
  if (f.length > 0) {
    writer.writePackedFloat(
      2,
      f
    );
  }
  f = message.getDurationsList();
  if (f.length > 0) {
    writer.writePackedFloat(
      3,
      f
    );
  }
};


/**
 * optional int32 periodsPerClass = 1;
 * @return {number}
 */
proto.TimetableConstraints.PeriodInfo.prototype.getPeriodsperclass = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.setPeriodsperclass = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * repeated float periodTimes = 2;
 * @return {!Array<number>}
 */
proto.TimetableConstraints.PeriodInfo.prototype.getPeriodtimesList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 2));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.setPeriodtimesList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.addPeriodtimes = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.clearPeriodtimesList = function() {
  return this.setPeriodtimesList([]);
};


/**
 * repeated float durations = 3;
 * @return {!Array<number>}
 */
proto.TimetableConstraints.PeriodInfo.prototype.getDurationsList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 3));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.setDurationsList = function(value) {
  return jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.addDurations = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.TimetableConstraints.PeriodInfo} returns this
 */
proto.TimetableConstraints.PeriodInfo.prototype.clearDurationsList = function() {
  return this.setDurationsList([]);
};


/**
 * optional int32 start = 1;
 * @return {number}
 */
proto.TimetableConstraints.prototype.getStart = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.setStart = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int32 end = 2;
 * @return {number}
 */
proto.TimetableConstraints.prototype.getEnd = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.setEnd = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional string days = 3;
 * @return {string}
 */
proto.TimetableConstraints.prototype.getDays = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.setDays = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int32 gap = 4;
 * @return {number}
 */
proto.TimetableConstraints.prototype.getGap = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.setGap = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int32 maxdays = 5;
 * @return {number}
 */
proto.TimetableConstraints.prototype.getMaxdays = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.setMaxdays = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * repeated PeriodInfo periodInfo = 6;
 * @return {!Array<!proto.TimetableConstraints.PeriodInfo>}
 */
proto.TimetableConstraints.prototype.getPeriodinfoList = function() {
  return /** @type{!Array<!proto.TimetableConstraints.PeriodInfo>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.TimetableConstraints.PeriodInfo, 6));
};


/**
 * @param {!Array<!proto.TimetableConstraints.PeriodInfo>} value
 * @return {!proto.TimetableConstraints} returns this
*/
proto.TimetableConstraints.prototype.setPeriodinfoList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.TimetableConstraints.PeriodInfo=} opt_value
 * @param {number=} opt_index
 * @return {!proto.TimetableConstraints.PeriodInfo}
 */
proto.TimetableConstraints.prototype.addPeriodinfo = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.TimetableConstraints.PeriodInfo, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.TimetableConstraints} returns this
 */
proto.TimetableConstraints.prototype.clearPeriodinfoList = function() {
  return this.setPeriodinfoList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.AutoTimetableResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.AutoTimetableResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.AutoTimetableResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.AutoTimetableResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.AutoTimetableResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    timesList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 1)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.AutoTimetableResponse}
 */
proto.AutoTimetableResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.AutoTimetableResponse;
  return proto.AutoTimetableResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.AutoTimetableResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.AutoTimetableResponse}
 */
proto.AutoTimetableResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedFloat() : [reader.readFloat()]);
      for (var i = 0; i < values.length; i++) {
        msg.addTimes(values[i]);
      }
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.AutoTimetableResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.AutoTimetableResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.AutoTimetableResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.AutoTimetableResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimesList();
  if (f.length > 0) {
    writer.writePackedFloat(
      1,
      f
    );
  }
};


/**
 * repeated float times = 1;
 * @return {!Array<number>}
 */
proto.AutoTimetableResponse.prototype.getTimesList = function() {
  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 1));
};


/**
 * @param {!Array<number>} value
 * @return {!proto.AutoTimetableResponse} returns this
 */
proto.AutoTimetableResponse.prototype.setTimesList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {number} value
 * @param {number=} opt_index
 * @return {!proto.AutoTimetableResponse} returns this
 */
proto.AutoTimetableResponse.prototype.addTimes = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.AutoTimetableResponse} returns this
 */
proto.AutoTimetableResponse.prototype.clearTimesList = function() {
  return this.setTimesList([]);
};


goog.object.extend(exports, proto);
