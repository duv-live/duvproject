import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getTokenFromStore } from 'utils/localStorage';
import { Loading } from './PlayingMusicAnimation';
import AlertMessage from 'components/common/utils/AlertMessage';

const UploadGallery = ({ afterSave }) => {
  const MAX_IMG_SIZE = 1000000; //1MB

  // HOOKS
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = event => {
    const file = event.target.files[0];
    if (!file) {
      return null;
    }

    setLoading(true);
    setMessage(null);

    if (file.size > MAX_IMG_SIZE) {
      setMessage(
        `'${
          file.name
        }' is too large, please pick a file smaller than ${MAX_IMG_SIZE /
          1000}kb`
      );
      setLoading(false);
    } else if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      setMessage(
        "Unsupported format. Only '.png' and '.jpg' files are supported"
      );
      setLoading(false);
    } else {
      const data = new FormData();
      data.append('image', file);

      axios
        .post('/api/v1/gallery/save', data, {
          headers: { 'x-access-token': getTokenFromStore() }
        })
        .then(function(response) {
          const { status, data } = response;
          if (status === 200) {
            setLoading(false);
            afterSave(data.image);
            setMessage('Image has been successfully uplaoded');
          }
        })
        .catch(function(error) {
          setMessage(error.response.data.message);
          setLoading(false);
        });
    }
  };

  return (
    <>
      <div className="upload-button">
        <input id="image" onChange={onChangeHandler} type="file" />
        <label
          className="btn btn-danger btn-wide btn-transparent"
          htmlFor="image"
        >
          {loading ? (
            <>
              <Loading />
              Uploading
            </>
          ) : (
            'Add New Image'
          )}
        </label>
      </div>
      <AlertMessage.Text message={message} />
    </>
  );
};

UploadGallery.propTypes = {
  afterSave: PropTypes.func.isRequired
};

export default UploadGallery;
