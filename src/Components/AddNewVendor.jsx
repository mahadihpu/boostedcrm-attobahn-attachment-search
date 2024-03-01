import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
const ZOHO = window.ZOHO;

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

export default function AddNewVendor({
  updateNewVendorInfo,
  handleClose,
  userList,
  setSnackbarMessage,
  setSeverity,
  setOpenSnackbar,
}) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      Vendor_Name: "",
      Vendor_Type_New: null,
      Owner: { full_name: "Ken Lobban", id: "4828892000001466001" },
      Assigned_Staff: { full_name: "Finairo", id: "4828892000031774001" },
      Website: "",
      Street: "",
      City: "",
      State: "",
      Zip_Code: "",
      Country: "",
      Contact_Name: "",
      Contact_Last_Name: "",
      Contact_Title: "",
      Contact_Telephone: "",
      Contact_Email: "",
    },
  });

  const onSubmit = async (data) => {
    let valid = true;
    let required_fields_api_names = [];
    if (data?.Vendor_Type_New === "Subscription") {
      required_fields_api_names.push("Website");
    } else {
      required_fields_api_names = [
        "Street",
        "City",
        "State",
        "Zip_Code",
        "Country",
        "Contact_Name",
        "Contact_Last_Name",
        "Contact_Email",
      ];
    }
    required_fields_api_names?.forEach((fieldName) => {
      const isValid =
        data?.[fieldName] !== null &&
        data?.[fieldName] !== undefined &&
        data?.[fieldName] !== "";
      valid = valid && isValid;
    });

    const createObj = data;
    createObj.NDA_Required = "No";
    try {
      setLoading(true);
      await ZOHO.CRM.API.insertRecord({
        Entity: "Vendors",
        APIData: data,
        Trigger: ["workflow"],
      }).then(function (data) {
        if (data?.data[0]?.message === "record added") {
          setLoading(false);
          if (valid) {
            createObj.Vendor_Status = "Pending Review";
          } else {
            createObj.Vendor_Status = "Collecting Info";
          }
          const vendorId = data?.data[0]?.details?.id;
          createObj.id = vendorId;
          updateNewVendorInfo(createObj);
          setSnackbarMessage("Vendor created successfully");
          setSeverity("success");
          setOpenSnackbar(true);
          handleClose();
        } else {
          setLoading(false);
          setSnackbarMessage("Vendor creation Error!!!");
          setSeverity("error");
          setOpenSnackbar(true);
        }
      });
    } catch (error) {
      setLoading(false);
      setSnackbarMessage(error?.data[0]?.message);
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <Box sx={{ my: 1, mx: 2, p: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: "normal",
              textAlign: "center",
              mb: 1.5,
            }}
          >
            Vendor Creation Form
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      required
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Vendor Name"
                      // error={errorMap?.includes("State_of_Incorporation")}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Vendor_Name"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="Vendor_Type_New"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      options={[
                        "Independent Contractor",
                        "Local Counsel",
                        "Subscription",
                        "Service Provider",
                        "Supplier",
                        "IP Authority",
                        "Partner",
                        "Carrier",
                        "Other",
                      ]}
                      size="small"
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        if (data) {
                          field.onChange(data);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          sx={{ m: 0, pt: 0 }}
                          InputLabelProps={{ shrink: true }}
                          label="Vendor Type"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Website"
                      // error={errorMap?.includes("Country_of_Formation")}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Website"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Contact First Name"
                      // error={errorMap?.includes("Account_Code")}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Contact_Name"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      fullWidth
                      label="Street"
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Street"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Contact Last Name"
                      // error={errorMap?.includes("Account_Code")}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Contact_Last_Name"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="City"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="City"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Contact Title"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Contact_Title"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="State"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="State"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Contact Telephone"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Contact_Telephone"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Zip Code"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Zip_Code"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Contact Email"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Contact_Email"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      sx={{
                        borderLeft: "3px solid red",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderLeftColor: "transparent",
                          },
                      }}
                      label="Country"
                      InputProps={{
                        disableUnderline: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Country"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="Owner"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={userList}
                      size="small"
                      getOptionLabel={(option) => option?.full_name}
                      onChange={(_, data) => {
                        data
                          ? field.onChange({
                              full_name: data?.full_name,
                              id: data?.id,
                            })
                          : field.onChange(null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Owner")}
                          InputLabelProps={{ shrink: true }}
                          label="Vendor Owner"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="Assigned_Staff"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={userList}
                      size="small"
                      getOptionLabel={(option) => option?.full_name}
                      onChange={(_, data) => {
                        data
                          ? field.onChange({
                              full_name: data?.full_name,
                              id: data?.id,
                            })
                          : field.onChange(null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Delegated To"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            {/* <Grid item xs={6}></Grid> */}
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{ width: 100, mr: 2 }}
              size="small"
              variant="outlined"
              type="submit"
            >
              Cancel
            </Button>
            <Button
              //   onClick={handleUpdateCompliance}
              sx={{ width: 100 }}
              size="small"
              variant="contained"
              type="submit"
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Create"
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
