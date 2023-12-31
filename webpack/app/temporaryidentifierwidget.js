var TemporaryIdentifierWidgetController,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

import $ from "jquery";

TemporaryIdentifierWidgetController = (function() {
  function TemporaryIdentifierWidgetController() {
    this.debug = bind(this.debug, this);
    this.get_portal_url = bind(this.get_portal_url, this);
    this.ajax_submit = bind(this.ajax_submit, this);
    this.render_template = bind(this.render_template, this);
    this.template_dialog = bind(this.template_dialog, this);
    this.search_mrn = bind(this.search_mrn, this);
    this.get_subfield = bind(this.get_subfield, this);
    this.format_date = bind(this.format_date, this);
    this.set_sibling_value = bind(this.set_sibling_value, this);
    this.get_sibling = bind(this.get_sibling, this);
    this.get_field_name = bind(this.get_field_name, this);
    this.get_input_element = bind(this.get_input_element, this);
    this.get_autogenerated_id = bind(this.get_autogenerated_id, this);
    this.get_current_id = bind(this.get_current_id, this);
    this.set_current_id = bind(this.set_current_id, this);
    this.set_temporary = bind(this.set_temporary, this);
    this.on_keypress = bind(this.on_keypress, this);
    this.on_value_change = bind(this.on_value_change, this);
    this.on_temporary_change = bind(this.on_temporary_change, this);
    this.bind_event_handler = bind(this.bind_event_handler, this);
    this.reset_value = bind(this.reset_value, this);
    this.reset_values = bind(this.reset_values, this);
    console.debug("TemporaryIdentifierWidget::load");
    this.auto_wildcard = "-- autogenerated --";
    this.is_add_sample_form = document.body.classList.contains("template-ar_add");
    if (this.is_add_sample_form) {
      this.reset_values();
    }
    this.bind_event_handler();
    return this;
  }


  /*
  Reset value_auto from all identifier widgets and value from identifier widgets
  that are temporary
   */

  TemporaryIdentifierWidgetController.prototype.reset_values = function() {
    var el, i, j, k, len, len1, len2, ref, ref1, ref2, results, selector;
    this.debug("°°° TemporaryIdentifierWidget::reset_values");
    selector = ".TemporaryIdentifier.temporary-id input[id$='_value']";
    ref = document.querySelectorAll(selector);
    for (i = 0, len = ref.length; i < len; i++) {
      el = ref[i];
      this.reset_value(el, this.auto_wildcard);
    }
    selector = ".TemporaryIdentifier.temporary-id input[name*='.value:']";
    ref1 = document.querySelectorAll(selector);
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      el = ref1[j];
      this.reset_value(el, this.auto_wildcard);
    }
    selector = ".TemporaryIdentifier input[name*='.value_auto:']";
    ref2 = document.querySelectorAll(selector);
    results = [];
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      el = ref2[k];
      results.push(this.reset_value(el));
    }
    return results;
  };


  /*
  Reset the value for the given element
   */

  TemporaryIdentifierWidgetController.prototype.reset_value = function(el, value) {
    if (value == null) {
      value = "";
    }
    this.debug("°°° TemporaryIdentifierWidget::reset_value:el=" + (el.id || el.name) + ",value='" + value + "'");
    return el.value = value;
  };

  TemporaryIdentifierWidgetController.prototype.bind_event_handler = function() {
    this.debug("TemporaryIdentifierWidget::bind_event_handler");
    $("body").on("change", ".TemporaryIdentifier input[type='checkbox']", this.on_temporary_change);
    $("body").on("change", ".TemporaryIdentifier input[type='text']", this.on_value_change);
    return $("body").on("keypress", ".TemporaryIdentifier input[type='text']", this.on_keypress);
  };


  /*
  Event handler for TemporaryIdentifier's checkbox change
   */

  TemporaryIdentifierWidgetController.prototype.on_temporary_change = function(event) {
    var auto, el, field, input_field, is_temporary;
    this.debug("°°° TemporaryIdentifierWidget::on_temporary_change °°°");
    el = event.currentTarget;
    field = this.get_field_name(el);
    is_temporary = el.checked;
    this.set_temporary(field, is_temporary);
    auto = this.get_autogenerated_id(field, this.auto_wildcard);
    input_field = this.get_input_element(field);
    input_field.disabled = is_temporary;
    if (is_temporary && !input_field.value) {
      input_field.value = auto;
      return $(input_field).trigger("change");
    } else if (!is_temporary && input_field.value === auto) {
      input_field.value = "";
      return $(input_field).trigger("change");
    }
  };


  /*
  Event handler for TemporaryIdentifier's value change
   */

  TemporaryIdentifierWidgetController.prototype.on_value_change = function(event) {
    var catalog_name, current_value, el, field;
    this.debug("°°° TemporaryIdentifierWidget::on_value_change °°°");
    el = event.currentTarget;
    field = this.get_field_name(el);
    current_value = this.get_current_id(field);
    this.set_current_id(field, el.value);
    if (!(el.value && el.value !== this.auto_wildcard)) {
      return;
    }
    catalog_name = this.get_sibling(el, "config_catalog").value;
    return this.search_mrn(el.value, catalog_name).done(function(data) {
      var address, buttons, dialog, me, record, template_id;
      if (!data) {
        return;
      }
      address = [data.address, data.zipcode, data.city, data.country].filter(function(value) {
        return value;
      });
      record = {
        "PatientFullName": data.Title,
        "PatientAddress": address.join(", "),
        "DateOfBirth": this.format_date(data.birthdate),
        "Age": data.age,
        "Sex": data.sex,
        "Gender": data.gender,
        "review_state": data.review_state
      };
      template_id = "existing-identifier";
      buttons = null;
      if (data.review_state === "inactive") {
        template_id = "inactive-patient";
        buttons = {};
        buttons[_t("Close")] = function() {
          $(this).trigger("no");
          return $(this).dialog("close");
        };
      }
      me = this;
      if (data.identifier == null) {
        data.identifier = el.value;
      }
      dialog = this.template_dialog(template_id, data, buttons);
      dialog.on("yes", function() {
        var results, value;
        results = [];
        for (field in record) {
          value = record[field];
          results.push(me.set_sibling_value(el, field, value));
        }
        return results;
      });
      return dialog.on("no", function() {
        el.value = current_value;
        return me.set_current_id(field, current_value);
      });
    });
  };


  /*
  Event handler for TemporaryIdentifier's value change
   */

  TemporaryIdentifierWidgetController.prototype.on_keypress = function(event) {
    var el;
    if (event.keyCode === 13) {
      el = event.currentTarget;
      $(el).trigger("blur");
      return event.preventDefault();
    }
  };


  /*
  Sets the temporary value of te field
   */

  TemporaryIdentifierWidgetController.prototype.set_temporary = function(field, is_temporary) {
    return this.get_subfield(field, "temporary").value = is_temporary || "";
  };


  /*
  Sets the current id value of the field
   */

  TemporaryIdentifierWidgetController.prototype.set_current_id = function(field, value) {
    return this.get_subfield(field, "value").value = value;
  };


  /*
  Returns the current id value of the field
   */

  TemporaryIdentifierWidgetController.prototype.get_current_id = function(field, default_value) {
    if (default_value == null) {
      default_value = "";
    }
    return this.get_subfield(field, "value").value || default_value;
  };


  /*
  Returns the id value that is/was auto-generated for the field
   */

  TemporaryIdentifierWidgetController.prototype.get_autogenerated_id = function(field, default_value) {
    if (default_value == null) {
      default_value = "";
    }
    return this.get_subfield(field, "value_auto").value || default_value;
  };


  /*
  Returns the input element for manual introduction of an identifier value
   */

  TemporaryIdentifierWidgetController.prototype.get_input_element = function(field) {
    return document.querySelector("#" + field + "_value");
  };


  /*
  Returns the field name the element belongs to
   */

  TemporaryIdentifierWidgetController.prototype.get_field_name = function(element) {
    var parent;
    parent = element.closest("div[data-fieldname]");
    return $(parent).attr("data-fieldname");
  };


  /*
  Returns the sibling field element with the specified name
   */

  TemporaryIdentifierWidgetController.prototype.get_sibling = function(element, name) {
    var field, parent, sample_num;
    field = name;
    if (this.is_add_sample_form) {
      parent = element.closest("td[arnum]");
      sample_num = $(parent).attr("arnum");
      field = name + '-' + sample_num;
    }
    return document.querySelector('[name="' + field + '"]');
  };


  /*
  Sets the value for an sibling field with specified base name
   */

  TemporaryIdentifierWidgetController.prototype.set_sibling_value = function(element, name, value) {
    var field;
    this.debug("°°° TemporaryIdentifierWidget::set_sibling_value:name=" + name + ",value=" + value + " °°°");
    field = this.get_sibling(element, name);
    if (!field) {
      return;
    }
    this.debug(">>> " + field.name + " = " + value + " ");
    return field.value = value;
  };


  /*
  Formats a date to yyyy-mm-dd
   */

  TemporaryIdentifierWidgetController.prototype.format_date = function(date_value) {
    var d, out;
    if (date_value == null) {
      return "";
    }
    d = new Date(date_value);
    out = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)];
    return out.join('-');
  };

  TemporaryIdentifierWidgetController.prototype.get_subfield = function(field, subfield) {
    return document.querySelector('input[name^="' + field + '.' + subfield + ':"]');
  };


  /*
  Searches by medical record number. Returns a dict with information about the
  patient if the mrn is found. Returns nothing otherwise
   */

  TemporaryIdentifierWidgetController.prototype.search_mrn = function(mrn, catalog_name) {
    var deferred, fields, options;
    this.debug("°°° TemporaryIdentifierWidget::search_mrn:mrn=" + mrn + " °°°");
    fields = ["Title", "name", "surname", "age", "birthdate", "sex", "gender", "email", "address", "zipcode", "city", "country", "review_state"];
    deferred = $.Deferred();
    options = {
      url: this.get_portal_url() + "/@@API/read",
      data: {
        portal_type: "Patient",
        catalog_name: catalog_name,
        patient_mrn: mrn,
        include_fields: fields,
        page_size: 1
      }
    };
    this.ajax_submit(options).done(function(data) {
      var object;
      object = {};
      if (data.objects) {
        object = data.objects[0];
      }
      return deferred.resolveWith(this, [object]);
    });
    return deferred.promise();
  };


  /*
  Render the content of a Handlebars template in a jQuery UID dialog
  [1] http://handlebarsjs.com/
  [2] https://jqueryui.com/dialog/
   */

  TemporaryIdentifierWidgetController.prototype.template_dialog = function(template_id, context, buttons) {
    var content;
    if (buttons == null) {
      buttons = {};
      buttons[_t("Yes")] = function() {
        $(this).trigger("yes");
        return $(this).dialog("close");
      };
      buttons[_t("No")] = function() {
        $(this).trigger("no");
        return $(this).dialog("close");
      };
    }
    content = this.render_template(template_id, context);
    return $(content).dialog({
      width: 450,
      resizable: false,
      closeOnEscape: false,
      buttons: buttons,
      open: function(event, ui) {
        return $(".ui-dialog-titlebar-close").hide();
      }
    });
  };

  TemporaryIdentifierWidgetController.prototype.render_template = function(template_id, context) {

    /*
     * Render Handlebars JS template
     */
    var source, template;
    this.debug("°°° TemporaryIdentifierWidget::render_template:template_id:" + template_id + " °°°");
    source = $("#" + template_id).html();
    if (!source) {
      return;
    }
    template = Handlebars.compile(source);
    return template(context);
  };


  /*
  Ajax Submit with automatic event triggering and some sane defaults
   */

  TemporaryIdentifierWidgetController.prototype.ajax_submit = function(options) {
    var done;
    if (options == null) {
      options = {};
    }
    this.debug("°°° TemporaryIdentifierWidget::ajax_submit °°°");
    if (options.type == null) {
      options.type = "POST";
    }
    if (options.url == null) {
      options.url = this.get_portal_url();
    }
    if (options.context == null) {
      options.context = this;
    }
    if (options.dataType == null) {
      options.dataType = "json";
    }
    if (options.data == null) {
      options.data = {};
    }
    if (options._authenticator == null) {
      options._authenticator = $("input[name='_authenticator']").val();
    }
    console.debug(">>> ajax_submit::options=", options);
    $(this).trigger("ajax:submit:start");
    done = function() {
      return $(this).trigger("ajax:submit:end");
    };
    return $.ajax(options).done(done);
  };


  /*
  Returns the portal url (calculated in code)
   */

  TemporaryIdentifierWidgetController.prototype.get_portal_url = function() {
    var url;
    url = $("input[name=portal_url]").val();
    return url || window.portal_url;
  };


  /*
  Prints a debug message in console with this component name prefixed
   */

  TemporaryIdentifierWidgetController.prototype.debug = function(message) {
    return console.debug("[senaite.patient.temporary_identifier_widget] ", message);
  };

  return TemporaryIdentifierWidgetController;

})();

export default TemporaryIdentifierWidgetController;
