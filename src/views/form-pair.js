import React, { useState } from 'react';
import ReturnLink from 'Components/return-link.js';
import { useRouterContext } from 'Contexts/router.js';
import { usePairsContext } from 'Contexts/pairs.js';
import { generating, checkPrivate, checkPublic } from 'Utils/keys.js';
import Bus from 'Utils/bus.js';


let initialStateValue = {
  label: '',
  private: '',
  public: ''
};


const initialStateValidator = {
  label: 0,
  private: 0,
  public: 0
};


const FormPair = () => {

  const { changeRoute, route } = useRouterContext();
  const { add, get: getPair, modify } = usePairsContext();
  const editMode = route.uuid ? true : false;

  const [ stateValidator, setStateValidator ] = useState(initialStateValidator);
  const [ stateValue, setStateValue ] = useState(
    editMode
      ? getPair(route.uuid)
      : initialStateValue
  );


  const handlerSetValue = event => {
    const { keyState } = event.target.dataset;
    const { value } = event.target;
    setStateValue({
      ...stateValue,
      [keyState]: value
    });
    // remise à 0 des validations
    setStateValidator(initialStateValidator);
  };


  const clickGenerating = () => {
    Bus.dispatch('loading', true);
    setTimeout(() => {
      let pairGenerated = generating();
      setStateValue(
        {
          ...stateValue,
          private: pairGenerated.private.trim(),
          public: pairGenerated.public.trim()
        }
      );
      Bus.dispatch('loading', false);
    }, 50);
  };


  const checkValidator = () => {
    // 0 = OK, 1 = vide, 2 = rsa non valid
    let validator = {
      label: 0,
      private: 0,
      public: 0
    };

    if (!stateValue.label || stateValue.label === '')
      validator.label = 1;
    if (!checkPublic(stateValue.public))
      validator.public = 2;
    if (!checkPrivate(stateValue.private))
      validator.private = 2;
    if (!stateValue.private || stateValue.private === '')
      validator.private = 1;
    if (!stateValue.public || stateValue.public === '')
      validator.public = 1;

    return validator;
  };


  const save = () => {
    const validator = checkValidator();

    if (validator.label + validator.private + validator.public === 0) {
      if (editMode) {
        modify(route.uuid, {
          label: stateValue.label,
          private: stateValue.private,
          public: stateValue.public
        });
      } else {
        add({
          label: stateValue.label,
          private: stateValue.private,
          public: stateValue.public
        });
      }
      Bus.dispatch('success', 'Your key pair has been saved');
      changeRoute({ name: 'Index' });

    } else {
      setStateValidator(validator);
    }
  };


  return <div>
    <ReturnLink />

    <div className="u-margin-top-m">
      {/* label */}
      <div className="u-margin-top-m">
        <div className="u-margin-top-s">
          <label>Label</label>
          <input
            type="text"
            className="input-label"
            value={stateValue.label}
            data-key-state="label"
            onChange={handlerSetValue}
          />
          {stateValidator.label === 1
            ? <span className="form-error">This field is required</span>
            : ''
          }
        </div>
      </div>

      <div className="u-border u-margin-top-s u-themecolor-color u-themecolor-container u-padding-s">
        <i>
          Take care to import a pair of RSA 2048 keys, BONES does not test the consistency of the two keys
          as well as their size (2048). If you don't know what you are doing, use generation.
        </i>
        <button
          className="general-button generate-button u-margin-top-s save-key"
          onClick={() => clickGenerating()}
        >
          Generate pair of key
        </button>
      </div>

      {/* private key */}
      <div className="u-margin-top-s">
        <label>Your private key</label>
        <textarea
          name="name"
          rows="8"
          cols="80"
          placeholder="Paste your private key here"
          value={stateValue.private}
          data-key-state="private"
          onChange={handlerSetValue}
        />
        {stateValidator.private === 1
          ? <span className="form-error">This field is required</span>
          : ''
        }
        {stateValidator.private === 2
          ? <span className="form-error">This is not a RSA private key</span>
          : ''
        }
      </div>

      {/* public key */}
      <div className="u-margin-top-s">
        <label>Your public key</label>
        <textarea
          name="name"
          rows="8"
          cols="80"
          placeholder="Paste your public key here"
          value={stateValue.public}
          data-key-state="public"
          onChange={handlerSetValue}
        />
        {stateValidator.public === 1
          ? <span className="form-error">This field is required</span>
          : ''
        }
        {stateValidator.public === 2
          ? <span className="form-error">This is not a RSA public key</span>
          : ''
        }
      </div>
    </div>

    <button
      onClick={() => save()}
      className="general-button generate-button u-margin-top-s save-keys"
    >
      Save your pair
    </button>
  </div>;
};

export default FormPair;
