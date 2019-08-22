import React from 'react';
import PropTypes from 'prop-types';
import { connect, Field } from 'formik';
import classNames from 'classnames';
import { FeedbackMessage, feedback } from 'components/forms/form-helper';
import Tooltip from 'components/common/utils/Tooltip';
import ReactTags from 'react-tag-autocomplete';

// https://github.com/i-like-robots/react-tags/tree/6.0#allownew-optional

const AutoComplete = ({
  name,
  className,
  helpText,
  isValidMessage,
  formGroupClassName,
  formik,
  labelClassName,
  label,
  placeholder,
  removeButtonText,
  showFeedback,
  suggestions,
  tooltipText,
  tooltipPosition,
  value
}) => {
  return (
    <div className={classNames('form-group', formGroupClassName)}>
      <div>
        <Field name={name}>
          {({ field, form }) => {
            const fieldValue = field.value || value || [];
            return (
              <ReactTags
                allowBackspace={false}
                allowNew
                className={className}
                delimiters={['Enter', 'Tab', ',']}
                maxSuggestionsLength={18}
                onAddition={tag => {
                  const tags = [...fieldValue, tag];
                  form.setFieldValue(name, tags);
                }}
                onDelete={index => {
                  // debugger;
                  const tags = fieldValue.slice(0);
                  tags.splice(index, 1);
                  form.setFieldValue(name, tags);
                }}
                placeholderText={placeholder}
                removeButtonText={removeButtonText}
                suggestions={suggestions}
                tags={fieldValue}
              />
            );
          }}
        </Field>
        <label className={labelClassName} htmlFor={name} id={`${name}-label `}>
          {label}{' '}
          <Tooltip name={name} position={tooltipPosition} text={tooltipText} />
        </label>
      </div>
      <FeedbackMessage
        formik={formik}
        helpText={helpText}
        name={name}
        showFeedback={showFeedback}
        validMessage={isValidMessage}
      />
    </div>
  );
};

AutoComplete.propTypes = {
  className: PropTypes.string,
  formGroupClassName: PropTypes.string,
  formik: PropTypes.object.isRequired,
  helpText: PropTypes.string,
  isValidMessage: PropTypes.string,
  label: PropTypes.string,
  labelClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  removeButtonText: PropTypes.string,
  showFeedback: PropTypes.oneOf(Object.keys(feedback)),
  suggestions: PropTypes.array,
  tooltipPosition: PropTypes.string,
  tooltipText: PropTypes.string,
  value: PropTypes.array
};

AutoComplete.defaultProps = {
  className: null,
  formGroupClassName: null,
  helpText: null,
  isValidMessage: '',
  label: null,
  labelClassName: null,
  placeholder: null,
  removeButtonText: 'Click tag to remove',
  showFeedback: feedback.ALL,
  suggestions: [],
  tooltipPosition: 'right',
  tooltipText: null,
  value: []
};

export default connect(AutoComplete);