import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { app } from "../firebase";
import { useSelector } from "react-redux";
// import { current } from "@reduxjs/toolkit";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const params = useParams();
  //   console.log(currentUser);

  //   console.log(files);
  //   console.log(formData);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };
    fetchListing();
  }, []);

  const handleImageUpload = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      const promises = [];
      setImageUploadError(false);
      setUploading(true);

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((error) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload upto 6 images per listing!");
      setUploading(false);
    }
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          //   setUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
            // console.log(downloadURL);
          });
        }
      );
    });
  };
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };
  const handleInputChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({ ...formData, type: e.target.id });
    }
    if (
      e.target.id === "offer" ||
      e.target.id === "parking" ||
      e.target.id === "furnished"
    ) {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    )
      setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleUpdateListing = async (e) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least 1 image!");

      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount Price must be lower than regular price!");
      setError(false);
      setLoading(true);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      //   console.log(data);
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        // return;
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Edit a Listing
      </h1>
      <form
        onSubmit={handleUpdateListing}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* left div */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            value={formData.name}
          ></input>
          <textarea
            onChange={handleInputChange}
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            value={formData.description}
          ></textarea>
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            value={formData.address}
          ></input>

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleInputChange}
                checked={formData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleInputChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleInputChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleInputChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleInputChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.bedrooms}
              ></input>
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.bathrooms}
              ></input>
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleInputChange}
                value={formData.regularPrice}
              ></input>
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">
                  {formData.type === "rent" ? "($ / month)" : "($)"}
                </span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="1000000"
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleInputChange}
                  value={formData.discountPrice}
                ></input>
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">
                    {formData.type === "rent" ? "($ / month)" : "($)"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* rigt div */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            ></input>
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageUpload}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing-image"
                  className="w-40 h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Edit Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
