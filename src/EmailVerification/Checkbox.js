import React, { Component } from "react";
import { Field } from "formik";

class Checkbox extends Component {
  render() {
    const props = this.props;
    return (
      <Field name={props.name}>
        {({ field, form }) => {
          console.log('Field', props, field, form);
          return(
            <input
              type="checkbox"
              {...props}
              checked={field.value}
              onChange={(e) => {
                const checked = e.target.checked;
                form.setFieldValue(props.name, checked);
              }}
            />
          );
        }}
      </Field>
    );
  }
}

export default Checkbox;