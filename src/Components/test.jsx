import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  TableBody,
  Snackbar,
  Modal,
  Checkbox,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TableCell from "@mui/material/TableCell/TableCell";
import MuiAlert from "@mui/material/Alert";
import AddNewVendor from "./AddNewVendor";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const ZOHO = window.ZOHO;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 800,
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "10px",
  boxShadow: 24,
  p: 2,
};

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

function PORequestForm({
  poList,
  setPOList,
  woList,
  setWOList,
  prevPoRequest,
  recommendedVendor,
  userList,
  handleVendorSearch,
  loggedInUser,
  approvedVendors,
}) {
  const [loading, setLoading] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(true);
  const [vendorCheckbox, setVendorCheckbox] = useState({
    recommended: false,
    option2: false,
    option3: false,
  });
  const [vendorBooksId, setVendorBooksId] = useState();
  const [newVendor, setNewVendor] = useState();
  const [fileList, setFileList] = useState([]);
  const [invoiceAttachment, setInvoiceAttachment] = useState([]);
  const [quoteAttachedR, setQuoteAttachedR] = useState([]);
  const [quoteAttached2, setQuoteAttached2] = useState([]);
  const [quoteAttached3, setQuoteAttached3] = useState([]);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      Request_Date: null,
      PM_Name: loggedInUser,
      Name: "",
      Purchase_Type: "",
      Description: "",
      Terms: "",
      Amount: "",
      Attn: "",
      Address_Line_1: "",
      Address_Line_2: "",
      City_State_Zip: "",
      Country: "",
      NDA_Required: "",
      Continuation_PO: "",
      PO: "",
      Work_Order: "",
      WO: "",
      SSJ: "",
      Explanations: "",
      Vendor_Name_R: null,
      Vendor_Name_2: null,
      Vendor_Name_3: null,
      Website_R: "",
      Website_2: "",
      Website_3: "",
      Contact_First_Name_R: "",
      Contact_First_Name_2: "",
      Contact_First_Name_3: "",
      Contact_Name_R: "",
      Contact_Name_2: "",
      Contact_Name_3: "",
      Email_R: "",
      Email_2: "",
      Email_3: "",
      Phone_R: "",
      Phone_2: "",
      Phone_3: "",
      Other_Important_Terms: "",
    },
  });

  useEffect(() => {
    const fetchPoAndWo = async () => {
      const conn_name = "zoho_books_conn_used_in_widget_do_not_delete";
      const req_data = {
        method: "GET",
        url: `https://www.zohoapis.com/books/v3/purchaseorders?vendor_id=${vendorBooksId}&organization_id=746629578`,
        param_type: 1,
      };
      await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data).then(function (
        result
      ) {
        let vendorPO = result?.details?.statusMessage?.purchaseorders || [];
        setPOList(vendorPO?.map((item) => item?.purchaseorder_number));
      });

      await ZOHO.CRM.API.getRelatedRecords({
        Entity: "Vendors",
        RecordID: watchAllFields?.Vendor_Name_R?.id,
        RelatedList: "Work_Orders",
        page: 1,
        per_page: 200,
      }).then(function (data) {
        let vendorWO = data?.data || [];
        setWOList(vendorWO?.map((item) => item?.Work_Order_Number));
      });
    };

    if (vendorBooksId) {
      fetchPoAndWo();
    } else {
      setPOList([]);
      setWOList([]);
    }
  }, [vendorBooksId]);

  useEffect(() => {
    if (recommendedVendor) {
      setValue("Vendor_Name_R", {
        Vendor_Name: recommendedVendor.Vendor_Name,
        id: recommendedVendor.id,
      });
      setValue("Website_R", recommendedVendor?.Website);
      setValue("Contact_First_Name_R", recommendedVendor?.Contact_Name);
      setValue("Contact_Name_R", recommendedVendor?.Contact_Last_Name);
      setValue("Email_R", recommendedVendor?.Contact_Email);
      setValue("Phone_R", recommendedVendor?.Contact_Telephone);
      setVendorBooksId(recommendedVendor?.Books_Vendor_ID);
    }
  }, [recommendedVendor]);

  useEffect(() => {
    if (prevPoRequest) {
      setValue("Request_Date", prevPoRequest?.Request_Date);
      setValue("PM_Name", prevPoRequest?.PM_Name);
      setValue("Name", prevPoRequest?.Name);
      setValue("Purchase_Type", prevPoRequest?.Purchase_Type);
      setValue("Description", prevPoRequest?.Description);
      setValue("Terms", prevPoRequest?.Terms);
      setValue("Amount", prevPoRequest?.Amount);
      setValue("Attn", prevPoRequest?.Attn);
      setValue("Address_Line_1", prevPoRequest?.Address_Line_1);
      setValue("Address_Line_2", prevPoRequest?.Address_Line_2);
      setValue("City_State_Zip", prevPoRequest?.City_State_Zip);
      setValue("Country", prevPoRequest?.Country);
      setValue("NDA_Required", prevPoRequest?.NDA_Required);
      setValue("Continuation_PO", prevPoRequest?.Continuation_PO);
      setValue("PO", prevPoRequest?.PO);
      setValue("Work_Order", prevPoRequest?.Work_Order);
      setValue("WO", prevPoRequest?.WO);
      setValue("SSJ", prevPoRequest?.SSJ);
      setValue("Explanations", prevPoRequest?.Explanations);
      setValue(
        "Vendor_Name_R",
        prevPoRequest?.Vendor_Name_R
          ? {
              Vendor_Name: prevPoRequest?.Vendor_Name_R?.name,
              id: prevPoRequest?.Vendor_Name_R?.id,
            }
          : null
      );
      setValue(
        "Vendor_Name_2",
        prevPoRequest?.Vendor_Name_2
          ? {
              Vendor_Name: prevPoRequest?.Vendor_Name_2?.name,
              id: prevPoRequest?.Vendor_Name_2?.id,
            }
          : null
      );
      setValue(
        "Vendor_Name_3",
        prevPoRequest?.Vendor_Name_3
          ? {
              Vendor_Name: prevPoRequest?.Vendor_Name_3?.name,
              id: prevPoRequest?.Vendor_Name_3?.id,
            }
          : null
      );
      setValue("Website_R", prevPoRequest?.Website_R);
      setValue("Website_2", prevPoRequest?.Website_2);
      setValue("Website_3", prevPoRequest?.Website_3);
      setValue("Contact_First_Name_R", prevPoRequest?.Contact_First_Name_R);
      setValue("Contact_First_Name_2", prevPoRequest?.Contact_First_Name_2);
      setValue("Contact_First_Name_3", prevPoRequest?.Contact_First_Name_3);
      setValue("Contact_Name_R", prevPoRequest?.Contact_Name_R);
      setValue("Contact_Name_2", prevPoRequest?.Contact_Name_2);
      setValue("Contact_Name_3", prevPoRequest?.Contact_Name_3);
      setValue("Email_R", prevPoRequest?.Email_R);
      setValue("Email_2", prevPoRequest?.Email_2);
      setValue("Email_3", prevPoRequest?.Email_3);
      setValue("Phone_R", prevPoRequest?.Phone_R);
      setValue("Phone_2", prevPoRequest?.Phone_2);
      setValue("Phone_3", prevPoRequest?.Phone_3);
      setValue("Other_Important_Terms", prevPoRequest?.Other_Important_Terms);
      setValue("Status", prevPoRequest?.Status);
      setValue("id", prevPoRequest?.id);
    }
  }, [prevPoRequest]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const watchAllFields = watch();

  const updateNewVendorInfo = (data) => {
    if (newVendor === 1) {
      setValue("Vendor_Name_R", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setValue("Website_R", data?.Website);
      setValue("Contact_First_Name_R", data?.Contact_Name);
      setValue("Contact_Name_R", data?.Contact_Last_Name);
      setValue("Email_R", data?.Contact_Email);
      setValue("Phone_R", data?.Contact_Telephone);
    } else if (newVendor === 2) {
      setValue("Vendor_Name_2", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setValue("Website_2", data?.Website);
      setValue("Contact_First_Name_2", data?.Contact_Name);
      setValue("Contact_Name_2", data?.Contact_Last_Name);
      setValue("Email_2", data?.Contact_Email);
      setValue("Phone_2", data?.Contact_Telephone);
    } else if (newVendor === 3) {
      setValue("Vendor_Name_3", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setValue("Website_3", data?.Website);
      setValue("Contact_First_Name_3", data?.Contact_Name);
      setValue("Contact_Name_3", data?.Contact_Last_Name);
      setValue("Email_3", data?.Contact_Email);
      setValue("Phone_3", data?.Contact_Telephone);
    }
  };

  // const createVendor = async (createObj) => {
  //   console.log(createObj);
  //   try {
  //     await ZOHO.CRM.API.insertRecord({
  //       Entity: "Vendors",
  //       APIData: createObj,
  //       Trigger: ["workflow"],
  //     }).then(function (data) {
  //       if (data?.data[0]?.message === "record added") {
  //         return data?.data[0]?.details?.id;
  //       } else {
  //         setSnackbarMessage("Vendor creation Error!!!");
  //         setSeverity("error");
  //         setOpenSnackbar(true);
  //         return false;
  //       }
  //     });
  //   } catch (error) {
  //     setSnackbarMessage(error?.message);
  //     setSeverity("error");
  //     setOpenSnackbar(true);
  //     return false;
  //   }
  // };

  const handleUpdatePO = async (data) => {
    setLoading(true);
    try {
      var config = {
        Entity: "PO_Requests",
        APIData: {
          ...data,
        },
        Trigger: ["workflow"],
      };
      ZOHO.CRM.API.updateRecord(config).then(function (data) {
        if (data?.data[0]?.message === "record updated") {
          setLoading(false);
          setSnackbarMessage("Your PO Request has been updated successfully");
          setSeverity("success");
          setOpenSnackbar(true);
        } else {
          setLoading(false);
          setSnackbarMessage("Error....Please try later");
          setSeverity("error");
          setOpenSnackbar(true);
        }
      });
    } catch (error) {
      setLoading(false);
      setSnackbarMessage(error?.message);
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const onSubmit = async (data) => {
    if (saveAsDraft) {
      data.Status = "Draft";
    } else {
      data.Status = "Open";
    }

    if (data?.id) {
      handleUpdatePO(data);
      return;
    }

    if (data?.Purchase_Type === "Services" && fileList.length < 1) {
      setSnackbarMessage(
        "Supporting documentation must be uploaded for Services"
      );
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    if (data?.Terms === "Advanced" && invoiceAttachment.length < 1) {
      setSnackbarMessage("Please uploaded Invoice Attachment");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      await ZOHO.CRM.API.insertRecord({
        Entity: "PO_Requests",
        APIData: data,
        Trigger: ["workflow"],
      }).then(async function (data) {
        if (data?.data[0]?.message === "record added") {
          let po_Request_id = data?.data[0]?.details?.id;
          let attahmentArray = [
            ...fileList,
            ...invoiceAttachment,
            ...quoteAttachedR,
            ...quoteAttached2,
            ...quoteAttached3,
          ];
          for (const file of attahmentArray) {
            await ZOHO.CRM.API.attachFile({
              Entity: "PO_Requests",
              RecordID: po_Request_id,
              File: { Name: file.name, Content: file },
            }).then(function (data) {
              if (!data?.data[0]?.details?.id) {
                setSnackbarMessage(
                  "There is a issue uploading documents please check manually"
                );
                setSeverity("error");
                setOpenSnackbar(true);
              }
            });
          }
          setLoading(false);
          setSnackbarMessage("Your PO Request has been submitted successfully");
          setSeverity("success");
          setOpenSnackbar(true);
        } else {
          setLoading(false);
          setSnackbarMessage("Error....Please try later");
          setSeverity("error");
          setOpenSnackbar(true);
        }
      });
    } catch (error) {
      setLoading(false);
      setSnackbarMessage(error?.message);
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <Box sx={{ my: 1, mx: 2, p: 2 }}>
        {/* {JSON.stringify(watchAll)} */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="Request_Date"
                control={control}
                render={({ field }) => {
                  return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Request Date"
                        {...field}
                        onChange={(newValue) => {
                          field.onChange(dayjs(newValue).format("YYYY-MM-DD"));
                        }}
                        PopperProps={{
                          placement: "right-end",
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            sx={{ width: 300 }}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  );
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="PM_Name"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      disabled
                      options={[]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option?.name}
                      onChange={(_, data) => {
                        data
                          ? field.onChange({
                              name: data?.name,
                              id: data?.id,
                            })
                          : field.onChange(null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Owner")}
                          InputLabelProps={{ shrink: true }}
                          label="Project Mgr Name"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      id="outlined-basic"
                      variant="outlined"
                      required
                      size="small"
                      sx={{ width: 500 }}
                      label="Project Name"
                      // error={errorMap?.includes("State_of_Incorporation")}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Name"
                control={control}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="Purchase_Type"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      sx={{ width: 300 }}
                      options={["Goods", "Services"]}
                      size="small"
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        field.onChange(data);
                        if (data !== "Services") {
                          setFileList([]);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Purchase Type"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={6}>
              {watchAllFields?.Purchase_Type === "Services" && (
                <Box
                  sx={{
                    display: "flex",
                  }}
                >
                  <Box
                    sx={{
                      width: "23%",
                      marginTop: "10px",
                      marginRight: "3px",
                    }}
                  >
                    <label htmlFor="fileUpload">Upload File</label>
                  </Box>
                  <Box sx={{ width: "75%", mt: 1 }}>
                    <input
                      type="file"
                      id="fileUpload"
                      name="file"
                      onChange={(e) => {
                        setFileList(e.target.files);
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      multiline
                      required
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      rows={3}
                      fullWidth
                      label="Description"
                      // error={errorMap?.includes(
                      //   "Describe_what_the_Vendor_does_sells"
                      // )}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Description"
                control={control}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="Terms"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={["Net 30", "Net 15", "Upon Receipt", "Advanced"]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        field.onChange(data);
                        if (data !== "Advanced") {
                          setValue("Amount", null);
                          setInvoiceAttachment([]);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Terms"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            <Grid item xs={4}>
              {watchAllFields?.Terms === "Advanced" && (
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        label="Amount"
                        sx={{ width: 300, ml: 2.5 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Amount"
                  control={control}
                />
              )}
            </Grid>

            <Grid item xs={4}>
              {watchAllFields?.Terms === "Advanced" && (
                <Box
                  sx={{
                    display: "flex",
                  }}
                >
                  <Box
                    sx={{
                      width: "23%",
                      marginTop: "10px",
                      marginRight: "3px",
                    }}
                  >
                    <label htmlFor="invoiceAttachment">Upload Invoice</label>
                  </Box>
                  <Box sx={{ width: "75%", mt: 1 }}>
                    <input
                      type="file"
                      id="invoiceAttachment"
                      onChange={(e) => {
                        setInvoiceAttachment(e.target.files);
                      }}
                      name="file"
                    />
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ my: 1 }}>Ship To:</Typography>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ display: "flex" }}>
                {" "}
                <Typography sx={{ my: 1 }}>Attn</Typography>{" "}
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        required
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, ml: 13 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Attn"
                  control={control}
                />
              </Box>

              <Box sx={{ display: "flex", mt: 1 }}>
                {" "}
                <Typography sx={{ my: 1 }}>Address Line#1</Typography>{" "}
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        required
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, ml: 2.5 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Address_Line_1"
                  control={control}
                />
              </Box>

              <Box sx={{ display: "flex", mt: 1 }}>
                {" "}
                <Typography sx={{ my: 1 }}>Address Line #2</Typography>{" "}
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, ml: 2 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Address_Line_2"
                  control={control}
                />
              </Box>

              <Box sx={{ display: "flex", mt: 1 }}>
                {" "}
                <Typography sx={{ my: 1 }}>City, State, Zip</Typography>{" "}
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        required
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, ml: 3.5 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="City_State_Zip"
                  control={control}
                />
              </Box>

              <Box sx={{ display: "flex", mt: 1 }}>
                {" "}
                <Typography sx={{ my: 1 }}>Country</Typography>{" "}
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        required
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        sx={{ width: 300, ml: 9.5 }}
                        // error={errorMap?.includes("Country_of_Formation")}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Country"
                  control={control}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Typography>
                Identify an Attobahn-approved Receiving party who will be
                responsible for receiving the goods/services, verifying the
                quality and quantity, and returning goods or confirming the
                goods/services are acceptable as received.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="NDA_Required"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={["Yes", "No"]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        field.onChange(data);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Non-Disclosure Agreement Required"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Controller
                name="Continuation_PO"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={["Yes", "No"]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        if (data === "Yes") {
                          setValue("Work_Order", "No");
                          setValue("SSJ", "No");
                          setValue("WO", null);
                          setValue("Explanations", null);
                        }
                        field.onChange(data);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Continuation PO"
                        />
                      )}
                    />
                  );
                }}
              />
              {watchAllFields?.Continuation_PO === "Yes" && (
                <Controller
                  name="PO"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Autocomplete
                        {...field}
                        options={poList}
                        size="small"
                        sx={{ ml: 2, width: 300 }}
                        getOptionLabel={(option) => option}
                        onChange={(_, data) => {
                          data ? field.onChange(data) : field.onChange(null);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={errorMap?.includes("Owner")}
                            InputLabelProps={{ shrink: true }}
                            label="PO#"
                          />
                        )}
                      />
                    );
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} sx={{ display: "flex" }}>
              <Controller
                name="Work_Order"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={["Yes", "No"]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        if (data === "Yes") {
                          setValue("Continuation_PO", "No");
                          setValue("SSJ", "No");
                          setValue("PO", null);
                          setValue("Explanations", null);
                        }
                        field.onChange(data);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Work Order"
                        />
                      )}
                    />
                  );
                }}
              />
              {watchAllFields?.Work_Order === "Yes" && (
                <Controller
                  name="WO"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Autocomplete
                        {...field}
                        options={woList}
                        size="small"
                        sx={{ ml: 2, width: 300 }}
                        getOptionLabel={(option) => option}
                        onChange={(_, data) => {
                          data ? field.onChange(data) : field.onChange(null);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={errorMap?.includes("Owner")}
                            InputLabelProps={{ shrink: true }}
                            label="WO#"
                          />
                        )}
                      />
                    );
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="SSJ"
                control={control}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      {...field}
                      options={["Yes", "No"]}
                      size="small"
                      sx={{ width: 300 }}
                      getOptionLabel={(option) => option}
                      onChange={(_, data) => {
                        if (data === "Yes") {
                          setValue("Continuation_PO", "No");
                          setValue("Work_Order", "No");
                          setValue("PO", null);
                          setValue("WO", null);
                        }
                        field.onChange(data);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          // error={errorMap?.includes("Assigned_Staff")}
                          InputLabelProps={{ shrink: true }}
                          label="Sole Source Justification"
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            {watchAllFields?.SSJ === "Yes" && (
              <Grid item xs={12}>
                <Controller
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        multiline
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        rows={4}
                        sx={{ mt: 2 }}
                        fullWidth
                        required
                        label="Explanation (Upon submission this Request will be routed directly to the CEO for approval of the SSJ)"
                        // error={errorMap?.includes(
                        //   "Describe_what_Vendor_will_sell_us"
                        // )}
                        InputLabelProps={{ shrink: true }}
                      />
                    );
                  }}
                  name="Explanations"
                  control={control}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography sx={{ my: 1 }}>Vendors Considered:</Typography>
              <TableContainer sx={{ my: 0.5 }} component={Paper}>
                <Table
                  size="small"
                  sx={{ minWidth: 700 }}
                  aria-label="simple table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{ px: 1, fontWeight: "bold" }}
                      ></TableCell>
                      <TableCell
                        align="left"
                        sx={{ px: 1, fontWeight: "bold" }}
                      >
                        Recommended
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ px: 1, fontWeight: "bold" }}
                      >
                        Option #2
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ px: 1, fontWeight: "bold" }}
                      >
                        Option #3
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ px: 1 }}>Vendor Name </TableCell>
                      <TableCell sx={{ px: 1 }}>
                        <Box sx={{ display: "flex" }}>
                          <Controller
                            name="Vendor_Name_R"
                            control={control}
                            render={({ field }) => {
                              return (
                                <Autocomplete
                                  id="free-solo-demo"
                                  {...field}
                                  options={approvedVendors}
                                  size="small"
                                  fullWidth
                                  getOptionLabel={(option) =>
                                    option.Vendor_Name
                                  }
                                  onChange={(event, newValue) => {
                                    if (newValue) {
                                      field.onChange({
                                        Vendor_Name: newValue.Vendor_Name,
                                        id: newValue.id,
                                      });
                                      setValue(
                                        "Vendor_R_Status",
                                        newValue?.Vendor_Status
                                      );
                                      setValue("Website_R", newValue?.Website);
                                      setValue(
                                        "Contact_First_Name_R",
                                        newValue?.Contact_Name
                                      );
                                      setValue(
                                        "Contact_Name_R",
                                        newValue?.Contact_Last_Name
                                      );
                                      setValue(
                                        "Email_R",
                                        newValue?.Contact_Email
                                      );
                                      setValue(
                                        "Phone_R",
                                        newValue?.Contact_Telephone
                                      );
                                      setVendorBooksId(
                                        newValue?.Books_Vendor_ID
                                      );
                                    } else {
                                      setVendorBooksId(null);
                                      setValue("Vendor_Name_R", null);
                                      setValue("Vendor_R_Status", "");
                                      setValue("Website_R", "");
                                      setValue("Contact_First_Name_R", "");
                                      setValue("Contact_Name_R", "");
                                      setValue("Email_R", "");
                                      setValue("Phone_R", "");
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} />
                                  )}
                                />
                              );
                            }}
                          />
                          {!watchAllFields?.Vendor_Name_R && (
                            <AddCircleIcon
                              onClick={() => {
                                setNewVendor(1);
                                handleOpen();
                              }}
                              sx={{
                                cursor: "pointer",
                                color: "#2196f3",
                                fontSize: 22,
                                mt: 1,
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 1 }}>
                        <Box sx={{ display: "flex" }}>
                          <Controller
                            name="Vendor_Name_2"
                            control={control}
                            render={({ field }) => {
                              return (
                                <Autocomplete
                                  id="free-solo-demo"
                                  {...field}
                                  fullWidth
                                  options={approvedVendors}
                                  size="small"
                                  getOptionLabel={(option) =>
                                    option.Vendor_Name
                                  }
                                  onChange={(event, newValue) => {
                                    if (newValue) {
                                      field.onChange({
                                        Vendor_Name: newValue.Vendor_Name,
                                        id: newValue.id,
                                      });
                                      setValue(
                                        "Vendor_2_Status",
                                        newValue?.Vendor_Status
                                      );
                                      setValue("Website_2", newValue?.Website);
                                      setValue(
                                        "Contact_First_Name_2",
                                        newValue?.Contact_Name
                                      );
                                      setValue(
                                        "Contact_Name_2",
                                        newValue?.Contact_Last_Name
                                      );
                                      setValue(
                                        "Email_2",
                                        newValue?.Contact_Email
                                      );
                                      setValue(
                                        "Phone_2",
                                        newValue?.Contact_Telephone
                                      );
                                    } else {
                                      setValue("Vendor_Name_2", null);
                                      setValue("Vendor_2_Status", "");
                                      setValue("Website_2", "");
                                      setValue("Contact_First_Name_2", "");
                                      setValue("Contact_Name_2", "");
                                      setValue("Email_2", "");
                                      setValue("Phone_2", "");
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} />
                                  )}
                                />
                              );
                            }}
                          />
                          {!watchAllFields?.Vendor_Name_2 && (
                            <AddCircleIcon
                              onClick={() => {
                                setNewVendor(2);
                                handleOpen();
                              }}
                              sx={{
                                cursor: "pointer",
                                color: "#2196f3",
                                fontSize: 22,
                                mt: 1,
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 1 }}>
                        <Box sx={{ display: "flex" }}>
                          <Controller
                            name="Vendor_Name_3"
                            control={control}
                            render={({ field }) => {
                              return (
                                <Autocomplete
                                  id="free-solo-demo"
                                  {...field}
                                  options={approvedVendors}
                                  size="small"
                                  fullWidth
                                  getOptionLabel={(option) =>
                                    option.Vendor_Name
                                  }
                                  onChange={(event, newValue) => {
                                    if (newValue) {
                                      field.onChange({
                                        Vendor_Name: newValue.Vendor_Name,
                                        id: newValue.id,
                                      });
                                      setValue(
                                        "Vendor_3_Status",
                                        newValue?.Vendor_Status
                                      );
                                      setValue("Website_3", newValue?.Website);
                                      setValue(
                                        "Contact_First_Name_3",
                                        newValue?.Contact_Name
                                      );
                                      setValue(
                                        "Contact_Name_3",
                                        newValue?.Contact_Last_Name
                                      );
                                      setValue(
                                        "Email_3",
                                        newValue?.Contact_Email
                                      );
                                      setValue(
                                        "Phone_3",
                                        newValue?.Contact_Telephone
                                      );
                                    } else {
                                      setValue("Vendor_Name_3", null);
                                      setValue("Vendor_3_Status", "");
                                      setValue("Website_3", "");
                                      setValue("Contact_First_Name_3", "");
                                      setValue("Contact_Name_3", "");
                                      setValue("Email_3", "");
                                      setValue("Phone_3", "");
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} />
                                  )}
                                />
                              );
                            }}
                          />
                          {!watchAllFields?.Vendor_Name_3 && (
                            <AddCircleIcon
                              onClick={() => {
                                setNewVendor(3);
                                handleOpen();
                              }}
                              sx={{
                                cursor: "pointer",
                                color: "#2196f3",
                                fontSize: 22,
                                mt: 1,
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1, fontWeight: "bold" }}>
                        Vendor Status{" "}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Vendor_R_Status}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Vendor_2_Status}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Vendor_3_Status}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1, fontWeight: "bold" }}>
                        Website{" "}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Website_R}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Website_2}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Website_3}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ px: 1 }}>Contact First Name </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Contact_First_Name_R}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Contact_First_Name_2}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Contact_First_Name_3}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1 }}>Contact Last Name </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Contact_Name_R}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Vendor_Name_2}
                      </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Vendor_Name_3}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1 }}>Email </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Email_R}
                      </TableCell>{" "}
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Email_2}
                      </TableCell>{" "}
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Email_3}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1 }}>Telephone </TableCell>
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Phone_R}
                      </TableCell>{" "}
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Phone_2}
                      </TableCell>{" "}
                      <TableCell sx={{ height: 30 }}>
                        {watchAllFields?.Phone_3}
                      </TableCell>{" "}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ px: 1 }}>
                        {watchAllFields?.Purchase_Type === "Services"
                          ? "Upload Detailed Description of Deliverable(s)"
                          : "Upload Vendor Quote(s)"}{" "}
                      </TableCell>
                      {watchAllFields?.Purchase_Type === "Services" ? (
                        <TableCell colSpan={3} sx={{ px: 1 }}>
                          <input
                            type="file"
                            onChange={(e) => {
                              setFileList(e.target.files);
                            }}
                          />
                        </TableCell>
                      ) : (
                        <>
                          <TableCell sx={{ px: 1 }}>
                            <input
                              type="file"
                              onChange={(e) => {
                                setQuoteAttachedR(e.target.files);
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 1 }}>
                            <input
                              type="file"
                              onChange={(e) => {
                                setQuoteAttached2(e.target.files);
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 1 }}>
                            <input
                              type="file"
                              onChange={(e) => {
                                setQuoteAttached3(e.target.files);
                              }}
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Controller
                render={({ field }) => {
                  return (
                    <TextField
                      {...field}
                      multiline
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      rows={4}
                      sx={{ mt: 2 }}
                      fullWidth
                      label="Other Important Terms and/or Considerations"
                      // error={errorMap?.includes(
                      //   "Describe_what_Vendor_will_sell_us"
                      // )}
                      InputLabelProps={{ shrink: true }}
                    />
                  );
                }}
                name="Other_Important_Terms"
                control={control}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button
              //   onClick={handleUpdateCompliance}
              sx={{ width: 150, mr: 2 }}
              size="small"
              variant="contained"
              onClick={() =>
                ZOHO.CRM.UI.Popup.closeReload().then(function (data) {
                  console.log(data);
                })
              }
            >
              Cancel
            </Button>
            {watchAllFields?.id ? (
              watchAllFields?.Status === "Draft" && (
                <>
                  <Button
                    onClick={() => setSaveAsDraft(true)}
                    disabled={loading}
                    sx={{ width: 150, mr: 2 }}
                    size="small"
                    variant="contained"
                    type="submit"
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Save As Draft"
                    )}
                  </Button>
                  <Button
                    onClick={() => setSaveAsDraft(false)}
                    disabled={
                      loading || !Object.values(vendorCheckbox).includes(true)
                    }
                    sx={{ width: 200 }}
                    size="small"
                    variant="contained"
                    type="submit"
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Send PO Request"
                    )}
                  </Button>
                </>
              )
            ) : (
              <>
                <Button
                  onClick={() => setSaveAsDraft(true)}
                  disabled={loading}
                  sx={{ width: 150, mr: 2 }}
                  size="small"
                  variant="contained"
                  type="submit"
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Save As Draft"
                  )}
                </Button>
                <Button
                  onClick={() => setSaveAsDraft(false)}
                  disabled={
                    loading || !Object.values(vendorCheckbox).includes(true)
                  }
                  sx={{ width: 200 }}
                  size="small"
                  variant="contained"
                  type="submit"
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Send PO Request"
                  )}
                </Button>
              </>
            )}
          </Box>
        </form>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <AddNewVendor
              updateNewVendorInfo={updateNewVendorInfo}
              handleClose={handleClose}
              userList={userList}
              setSnackbarMessage={setSnackbarMessage}
              setSeverity={setSeverity}
              setOpenSnackbar={setOpenSnackbar}
            />
          </Box>
        </Modal>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3800}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default React.memo(PORequestForm);
