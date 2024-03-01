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
  Paper,
  TableBody,
  Snackbar,
  Modal,
  Typography,
  Tooltip,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  p: 1,
};

const style1 = {
  position: "absolute",
  top: "50%",
  left: "50%",
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
  userList,
  prevPoRequest,
  vendors,
  attachmentsPreview,
}) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedAttachmentObj, setDeletedAttachmentObj] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState({
    vendor_R: {},
    venodr_2: {},
    vendor_3: {},
  });
  const [allAttachments, setAllAttachments] = useState({
    Services_File_Name: null,
    Advance_Payment_File_Name: null,
    Quote_Attached_1: null,
    Quote_Attached_2: null,
    Quote_Attached_3: null,
  });
  const [poList, setPOList] = useState(false);
  const [woList, setWOList] = useState(false);

  const [newVendor, setNewVendor] = useState();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      Purchase_Type: "",
      Terms: "",
      Continuation_PO: "",
      PO: "",
      Work_Order: "",
      WO: "",
      SSJ: "",
      Explanations: "",
      Vendor_Name_R: null,
      Vendor_Name_2: null,
      Vendor_Name_3: null,
    },
  });

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setDeletedAttachmentObj(null);
    setOpenModal(false);
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

  useEffect(() => {
    if (prevPoRequest) {
      let vendorTemp = { vendor_R: {}, vendor_2: {}, vendor_3: {} };
      if (prevPoRequest?.Vendor_Name_R) {
        let findVendor = vendors?.find(
          (item) => item.id === prevPoRequest?.Vendor_Name_R?.id
        );
        if (findVendor) {
          vendorTemp.vendor_R = findVendor;
          setValue("Vendor_Name_R", {
            Vendor_Name: prevPoRequest?.Vendor_Name_R?.name,
            id: prevPoRequest?.Vendor_Name_R?.id,
          });
        }
      }
      if (prevPoRequest?.Vendor_Name_2) {
        let findVendor = vendors?.find(
          (item) => item.id === prevPoRequest?.Vendor_Name_2?.id
        );
        if (findVendor) {
          vendorTemp.vendor_2 = findVendor;
          setValue("Vendor_Name_2", {
            Vendor_Name: prevPoRequest?.Vendor_Name_2?.name,
            id: prevPoRequest?.Vendor_Name_2?.id,
          });
        }
      }
      if (prevPoRequest?.Vendor_Name_3) {
        let findVendor = vendors?.find(
          (item) => item.id === prevPoRequest?.Vendor_Name_3?.id
        );
        if (findVendor) {
          vendorTemp.vendor_3 = findVendor;
          setValue("Vendor_Name_3", {
            Vendor_Name: prevPoRequest?.Vendor_Name_3?.name,
            id: prevPoRequest?.Vendor_Name_3?.id,
          });
        }
      }

      setSelectedVendors(vendorTemp);
      setValue("Purchase_Type", prevPoRequest?.Purchase_Type);
      setValue("Terms", prevPoRequest?.Terms);
      setValue("Continuation_PO", prevPoRequest?.Continuation_PO);
      setValue("PO", prevPoRequest?.PO);
      setValue("Work_Order", prevPoRequest?.Work_Order);
      setValue("WO", prevPoRequest?.WO);
      setValue("SSJ", prevPoRequest?.SSJ);
      setValue("Explanations", prevPoRequest?.Explanations);

      setValue("id", prevPoRequest?.id);
      let fileInfo = prevPoRequest?.Files_info
        ? JSON.parse(prevPoRequest?.Files_info)
        : {
            Services_File_Name: null,
            Advance_Payment_File_Name: null,
            Quote_Attached_1: null,
            Quote_Attached_2: null,
            Quote_Attached_3: null,
          };
      setAllAttachments(fileInfo);
    }
  }, [prevPoRequest]);

  useEffect(() => {
    if (
      !(
        watchAllFields?.Continuation_PO === "No" &&
        watchAllFields?.Work_Order === "No" &&
        watchAllFields?.SSJ === "No"
      )
    ) {
      const fetchWo = async () => {
        if (selectedVendors?.vendor_R?.id) {
          await ZOHO.CRM.API.getRelatedRecords({
            Entity: "Vendors",
            RecordID: selectedVendors?.vendor_R?.id,
            RelatedList: "Work_Orders",
            page: 1,
            per_page: 200,
          }).then(function (data) {
            let vendorWO = data?.data || [];
            setWOList(vendorWO?.map((item) => item?.Work_Order_Number));
          });
        }
      };

      const fetchPo = async () => {
        const conn_name = "zoho_books_conn_used_in_widget_do_not_delete";
        const req_data = {
          method: "GET",
          url: `https://www.zohoapis.com/books/v3/purchaseorders?vendor_id=${selectedVendors?.vendor_R?.Books_Vendor_ID}&organization_id=746629578`,
          param_type: 1,
        };
        await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data).then(function (
          result
        ) {
          let vendorPO = result?.details?.statusMessage?.purchaseorders || [];
          setPOList(vendorPO?.map((item) => item?.purchaseorder_number));
        });
      };
      fetchWo();
      if (selectedVendors?.vendor_R?.Books_Vendor_ID) {
        fetchPo();
      } else {
        setPOList([]);
      }
    }
  }, [selectedVendors?.vendor_R]);

  // delete attachment from module record
  const handleFileDelete = async () => {
    let { value, type } = deletedAttachmentObj;
    setDeleteLoading(true);
    var conn_name = "zoho_crm_conn";
    var req_data = {
      method: "DELETE",
      url: `https://www.zohoapis.com/crm/v4/PO_Requests/${watchAllFields?.id}/Attachments/${value?.id}`,
      param_type: 1,
    };
    await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data).then(async (data) => {
      if (
        data?.details?.statusMessage?.data?.[0]?.message === "record deleted"
      ) {
        let updatedFileInfo = { ...allAttachments, [type]: null };
        var config = {
          Entity: "PO_Requests",
          APIData: {
            id: watchAllFields?.id,
            Files_info: updatedFileInfo,
          },
          Trigger: [""],
        };
        await ZOHO.CRM.API.updateRecord(config).then(function (data) {
          if (data?.data?.[0]?.code === "SUCCESS") {
            setDeleteLoading(false);
            setSnackbarMessage("File deleted successfully.");
            setSeverity("success");
            setOpenSnackbar(true);
            setAllAttachments(updatedFileInfo);
            handleCloseModal();
          } else {
            setDeleteLoading(false);
            setSeverity("error");
            setSnackbarMessage("Something went wrong...");
            setOpenSnackbar(true);
          }
        });
      }
    });
  };

  // download attachment from module record
  const handleAttachmentPreview = async (id, name) => {
    let findLink = attachmentsPreview?.find(
      (item) => item.id === id && item.extn === "pdf"
    );

    if (findLink) {
      let previewLink = `https://crm.zoho.com${findLink?.$previewUrl}`;
      window.open(previewLink, "_blank");
    } else {
      setSnackbarMessage(
        "File Preview is only available for Pdf files. Unable to open this file please check related list Attachments section."
      );
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const updateNewVendorInfo = (data) => {
    if (newVendor === 1) {
      setValue("Vendor_Name_R", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setSelectedVendors({ ...selectedVendors, vendor_R: data });
    } else if (newVendor === 2) {
      setValue("Vendor_Name_2", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setSelectedVendors({ ...selectedVendors, venodr_2: data });
    } else if (newVendor === 3) {
      setValue("Vendor_Name_3", {
        Vendor_Name: data.Vendor_Name,
        id: data.id,
      });
      setSelectedVendors({ ...selectedVendors, vendor_3: data });
    }
  };

  const handleFileUpload = async (attachments) => {
    let keys = Object.keys(attachments);

    for (const key of keys) {
      if (attachments[key] && !attachments[key]?.id) {
        let file = attachments[key];
        await ZOHO.CRM.API.attachFile({
          Entity: "PO_Requests",
          RecordID: watchAllFields?.id,
          File: { Name: file.name, Content: file },
        }).then(function (data) {
          if (data?.data[0]?.details?.id) {
            attachments[key] = {
              name: file.name,
              id: data?.data[0]?.details?.id,
            };
          } else {
            return false;
          }
        });
      }
    }
    return attachments;
  };

  const onSubmit = async (data) => {
    let tempAttachment = { ...allAttachments };
    if (data?.Terms !== "Advanced Payment") {
      data.Amount = null;
      data.Invoice = null;
      tempAttachment.Advance_Payment_File_Name = null;
    }
    if (
      watchAllFields?.Continuation_PO === "Yes" ||
      watchAllFields?.Work_Order === "Yes" ||
      watchAllFields?.SSJ === "Yes"
    ) {
      data.Vendor_Name_2 = null;
      data.Vendor_Name_3 = null;
      if (data?.Purchase_Type === "Goods") {
        tempAttachment.Quote_Attached_2 = null;
        tempAttachment.Quote_Attached_3 = null;
        tempAttachment.Services_File_Name = null;
      } else {
        tempAttachment.Quote_Attached_1 = null;
        tempAttachment.Quote_Attached_2 = null;
        tempAttachment.Quote_Attached_3 = null;
      }
    } else {
      if (data?.Purchase_Type === "Goods") {
        tempAttachment.Services_File_Name = null;
      } else {
        tempAttachment.Quote_Attached_1 = null;
        tempAttachment.Quote_Attached_2 = null;
        tempAttachment.Quote_Attached_3 = null;
      }
    }

    setLoading(true);
    try {
      let upload = await handleFileUpload(tempAttachment);
      if (upload) {
        data.Files_info = JSON.stringify(upload);
        var config = {
          Entity: "PO_Requests",
          APIData: {
            ...data,
          },
          Trigger: ["workflow"],
        };
        ZOHO.CRM.API.updateRecord(config).then(async function (data) {
          if (data?.data[0]?.message === "record updated") {
            setLoading(false);
            ZOHO.CRM.UI.Popup.closeReload().then(function (data) {
              console.log(data);
            });
          } else {
            setLoading(false);
            setSnackbarMessage("Error....Please try later");
            setSeverity("error");
            setOpenSnackbar(true);
          }
        });
      } else {
        setSnackbarMessage(
          "Uploading supporting documents failed. Try again later!"
        );
        setSeverity("error");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {watchAllFields?.Continuation_PO === "No" &&
            watchAllFields?.Work_Order === "No" &&
            watchAllFields?.SSJ === "No" ? (
              <Grid item xs={12}>
                <Typography sx={{ my: 1, fontWeight: "bold" }}>
                  Vendors Selection:
                </Typography>
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
                        <TableCell
                          sx={{
                            width: 220,
                            px: 1,
                            fontWeight: "bold",
                            borderLeft: "3px solid red",
                          }}
                          align="right"
                        >
                          Vendor Name{" "}
                        </TableCell>
                        <TableCell sx={{ px: 1, width: 230 }}>
                          <Box sx={{ display: "flex" }}>
                            <Controller
                              name="Vendor_Name_R"
                              control={control}
                              render={({ field }) => {
                                return (
                                  <Autocomplete
                                    id="free-solo-demo"
                                    {...field}
                                    options={vendors?.filter(
                                      (item) =>
                                        ![
                                          watchAllFields?.Vendor_Name_2?.id,
                                          watchAllFields?.Vendor_Name_3?.id,
                                        ].includes(item.id)
                                    )}
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
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_R: newValue,
                                        });
                                      } else {
                                        setValue("Vendor_Name_R", null);
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_R: null,
                                        });
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
                        <TableCell sx={{ px: 1, width: 230 }}>
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
                                    options={vendors?.filter(
                                      (item) =>
                                        ![
                                          watchAllFields?.Vendor_Name_R?.id,
                                          watchAllFields?.Vendor_Name_3?.id,
                                        ].includes(item.id)
                                    )}
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
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_2: newValue,
                                        });
                                      } else {
                                        setValue("Vendor_Name_2", null);
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_2: null,
                                        });
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
                        <TableCell sx={{ px: 1, width: 230 }}>
                          <Box sx={{ display: "flex" }}>
                            <Controller
                              name="Vendor_Name_3"
                              control={control}
                              render={({ field }) => {
                                return (
                                  <Autocomplete
                                    id="free-solo-demo"
                                    {...field}
                                    options={vendors?.filter(
                                      (item) =>
                                        ![
                                          watchAllFields?.Vendor_Name_R?.id,
                                          watchAllFields?.Vendor_Name_2?.id,
                                        ].includes(item.id)
                                    )}
                                    size="small"
                                    // sx={{
                                    //   borderLeft: "3px solid red",
                                    //   borderRadius: "8px",
                                    //   "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    //     {
                                    //       borderLeftColor: "transparent",
                                    //     },
                                    //   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    //     {
                                    //       borderLeftColor: "transparent",
                                    //     },
                                    // }}
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
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_3: newValue,
                                        });
                                        // setValue(
                                        //   "Vendor_3_Status",
                                        //   newValue?.Vendor_Status
                                        // );
                                        // setValue(
                                        //   "Website_3",
                                        //   newValue?.Website
                                        // );
                                        // setValue(
                                        //   "Contact_First_Name_3",
                                        //   newValue?.Contact_Name
                                        // );
                                        // setValue(
                                        //   "Contact_Name_3",
                                        //   newValue?.Contact_Last_Name
                                        // );
                                        // setValue(
                                        //   "Email_3",
                                        //   newValue?.Contact_Email
                                        // );
                                        // setValue(
                                        //   "Phone_3",
                                        //   newValue?.Contact_Telephone
                                        // );
                                      } else {
                                        setValue("Vendor_Name_3", null);
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_3: null,
                                        });
                                        // setValue("Vendor_3_Status", "");
                                        // setValue("Website_3", "");
                                        // setValue("Contact_First_Name_3", "");
                                        // setValue("Contact_Name_3", "");
                                        // setValue("Email_3", "");
                                        // setValue("Phone_3", "");
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
                        <TableCell
                          sx={{
                            px: 1,
                            fontWeight: "bold",
                            borderLeft: "3px solid red",
                          }}
                          align="right"
                        >
                          Vendor Status{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Vendor_Status}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Vendor_Status}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Vendor_Status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Website{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Website}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Website}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Website}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Contact First Name{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Name}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Contact_Name}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Contact_Name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Contact Last Name{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Last_Name}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Contact_Last_Name}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Contact_Last_Name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Email{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Email}
                        </TableCell>{" "}
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Contact_Email}
                        </TableCell>{" "}
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Contact_Email}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Telephone{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Telephone}
                        </TableCell>{" "}
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_2?.Contact_Telephone}
                        </TableCell>{" "}
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_3?.Contact_Telephone}
                        </TableCell>{" "}
                      </TableRow>
                      {watchAllFields?.Purchase_Type !== "Services" && (
                        <TableRow>
                          <TableCell
                            align="right"
                            sx={{
                              px: 1,
                              fontWeight: "bold",
                              borderLeft: "3px solid red",
                            }}
                          >
                            Upload Vendor Quote(s)
                          </TableCell>
                          <TableCell sx={{ px: 1 }}>
                            {allAttachments?.Quote_Attached_1?.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  my: 0.5,
                                }}
                              >
                                <Tooltip
                                  title={allAttachments?.Quote_Attached_1.name}
                                  placement="top"
                                >
                                  <Typography
                                    sx={{
                                      width: "200px",
                                      color: "blue",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onClick={() =>
                                      handleAttachmentPreview(
                                        allAttachments?.Quote_Attached_1.id,
                                        allAttachments?.Quote_Attached_1.name
                                      )
                                    }
                                  >
                                    {allAttachments?.Quote_Attached_1.name}
                                  </Typography>

                                  {/* <Typography
                                      sx={{
                                        textAlign: "left",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "200px",
                                      }}
                                    >
                                      {allAttachments?.Quote_Attached_1.name}
                                    </Typography> */}
                                </Tooltip>

                                <RemoveCircleOutlineOutlinedIcon
                                  onClick={() => {
                                    setDeletedAttachmentObj({
                                      type: "Quote_Attached_1",
                                      value: allAttachments?.Quote_Attached_1,
                                    });
                                    handleOpenModal();
                                  }}
                                  sx={{
                                    "&:hover": {
                                      cursor: "pointer",
                                    },
                                    color: "#ed2f4f",
                                  }}
                                />
                              </Box>
                            ) : (
                              <input
                                type="file"
                                onChange={(e) => {
                                  setAllAttachments({
                                    ...allAttachments,
                                    Quote_Attached_1: e.target.files[0],
                                  });
                                  // setQuoteAttachedR(e.target.files[0]);
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ px: 1 }}>
                            {allAttachments?.Quote_Attached_2?.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  my: 0.5,
                                }}
                              >
                                <Tooltip
                                  title={allAttachments?.Quote_Attached_2.name}
                                  placement="top"
                                >
                                  <Typography
                                    sx={{
                                      width: "200px",
                                      color: "blue",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onClick={() =>
                                      handleAttachmentPreview(
                                        allAttachments?.Quote_Attached_2.id,
                                        allAttachments?.Quote_Attached_2.name
                                      )
                                    }
                                  >
                                    {allAttachments?.Quote_Attached_2.name}
                                  </Typography>
                                </Tooltip>

                                <RemoveCircleOutlineOutlinedIcon
                                  onClick={() => {
                                    setDeletedAttachmentObj({
                                      type: "Quote_Attached_2",
                                      value: allAttachments?.Quote_Attached_2,
                                    });

                                    handleOpenModal();
                                  }}
                                  sx={{
                                    "&:hover": {
                                      cursor: "pointer",
                                    },
                                    color: "#ed2f4f",
                                  }}
                                />
                              </Box>
                            ) : (
                              <input
                                type="file"
                                onChange={(e) => {
                                  setAllAttachments({
                                    ...allAttachments,
                                    Quote_Attached_2: e.target.files[0],
                                  });
                                  // setQuoteAttached2(e.target.files[0]);
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ px: 1 }}>
                            {allAttachments?.Quote_Attached_3?.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  my: 0.5,
                                }}
                              >
                                <Tooltip
                                  title={allAttachments?.Quote_Attached_3.name}
                                  placement="top"
                                >
                                  <Typography
                                    sx={{
                                      width: "200px",
                                      color: "blue",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onClick={() =>
                                      handleAttachmentPreview(
                                        allAttachments?.Quote_Attached_3?.id,
                                        allAttachments?.Quote_Attached_3.name
                                      )
                                    }
                                  >
                                    {allAttachments?.Quote_Attached_3.name}
                                  </Typography>
                                </Tooltip>

                                <RemoveCircleOutlineOutlinedIcon
                                  onClick={() => {
                                    setDeletedAttachmentObj({
                                      type: "Quote_Attached_3",
                                      value: allAttachments?.Quote_Attached_3,
                                    });

                                    handleOpenModal();
                                  }}
                                  sx={{
                                    "&:hover": {
                                      cursor: "pointer",
                                    },
                                    color: "#ed2f4f",
                                  }}
                                />
                              </Box>
                            ) : (
                              <input
                                type="file"
                                onChange={(e) => {
                                  setAllAttachments({
                                    ...allAttachments,
                                    Quote_Attached_3: e.target.files[0],
                                  });
                                  // setQuoteAttached3(e.target.files[0]);
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Typography sx={{ my: 1, fontWeight: "bold" }}>
                  Vendor Selection:
                </Typography>
                <TableContainer sx={{ my: 0.5, width: 700 }} component={Paper}>
                  <Table size="small" aria-label="simple table">
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{
                            px: 1,
                            fontWeight: "bold",
                            borderLeft: "3px solid red",
                          }}
                        >
                          Vendor Name{" "}
                        </TableCell>
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
                                    options={vendors}
                                    size="small"
                                    sx={{
                                      minWidth: 300,
                                      // borderLeft: "3px solid red",
                                      // borderRadius: "8px",
                                      // "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                      //   {
                                      //     borderLeftColor: "transparent",
                                      //   },
                                      // "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                      //   {
                                      //     borderLeftColor: "transparent",
                                      //   },
                                    }}
                                    fullWidth
                                    getOptionLabel={(option) =>
                                      option.Vendor_Name
                                    }
                                    onChange={(event, newValue) => {
                                      setValue("PO", "");
                                      setValue("WO", "");
                                      if (newValue) {
                                        field.onChange({
                                          Vendor_Name: newValue.Vendor_Name,
                                          id: newValue.id,
                                        });
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_R: newValue,
                                        });
                                        // setValue(
                                        //   "Vendor_R_Status",
                                        //   newValue?.Vendor_Status
                                        // );
                                        // setValue(
                                        //   "Website_R",
                                        //   newValue?.Website
                                        // );

                                        // setValue(
                                        //   "Contact_First_Name_R",
                                        //   newValue?.Contact_Name
                                        // );
                                        // setValue(
                                        //   "Contact_Name_R",
                                        //   newValue?.Contact_Last_Name
                                        // );
                                        // setValue(
                                        //   "Email_R",
                                        //   newValue?.Contact_Email
                                        // );
                                        // setValue(
                                        //   "Phone_R",
                                        //   newValue?.Contact_Telephone
                                        // );
                                        // setValue(
                                        //   "Vendor_Books_Id",
                                        //   newValue?.Books_Vendor_ID
                                        // );
                                      } else {
                                        // setVendorBooksId(null);
                                        // setValue("Vendor_Books_Id", "");
                                        setValue("Vendor_Name_R", null);
                                        setSelectedVendors({
                                          ...selectedVendors,
                                          vendor_R: null,
                                        });
                                        // setValue("Vendor_R_Status", "");
                                        // setValue("Website_R", "");
                                        // setValue("Contact_First_Name_R", "");
                                        // setValue("Contact_Name_R", "");
                                        // setValue("Email_R", "");
                                        // setValue("Phone_R", "");
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
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{
                            px: 1,
                            fontWeight: "bold",
                            borderLeft: "3px solid red",
                          }}
                        >
                          Vendor Status{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Vendor_Status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Website{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Website}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Contact First Name{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Contact Last Name{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Last_Name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Email{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Email}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          align="right"
                          sx={{ px: 1, fontWeight: "bold" }}
                        >
                          Telephone{" "}
                        </TableCell>
                        <TableCell sx={{ height: 30 }}>
                          {selectedVendors?.vendor_R?.Contact_Telephone}
                        </TableCell>
                      </TableRow>
                      {watchAllFields?.Purchase_Type !== "Services" && (
                        <TableRow>
                          <TableCell
                            align="right"
                            sx={{
                              px: 1,
                              fontWeight: "bold",
                              borderLeft: "3px solid red",
                            }}
                          >
                            Upload Vendor Quote(s)
                          </TableCell>
                          <TableCell sx={{ height: 30 }}>
                            {allAttachments?.Quote_Attached_1?.id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  my: 0.5,
                                }}
                              >
                                <Tooltip
                                  title={allAttachments?.Quote_Attached_1.name}
                                  placement="top"
                                >
                                  <Typography
                                    sx={{
                                      width: "200px",
                                      color: "blue",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onClick={() =>
                                      handleAttachmentPreview(
                                        allAttachments?.Quote_Attached_1?.id,
                                        allAttachments?.Quote_Attached_1.name
                                      )
                                    }
                                  >
                                    {allAttachments?.Quote_Attached_1.name}
                                  </Typography>
                                </Tooltip>

                                <RemoveCircleOutlineOutlinedIcon
                                  onClick={() => {
                                    setDeletedAttachmentObj({
                                      type: "Quote_Attached_1",
                                      value: allAttachments?.Quote_Attached_1,
                                    });

                                    handleOpenModal();
                                  }}
                                  sx={{
                                    "&:hover": {
                                      cursor: "pointer",
                                    },
                                    color: "#ed2f4f",
                                  }}
                                />
                              </Box>
                            ) : (
                              <input
                                type="file"
                                onChange={(e) => {
                                  setAllAttachments({
                                    ...allAttachments,
                                    Quote_Attached_1: e.target.files[0],
                                  });
                                  // setQuoteAttachedR(e.target.files[0]);
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {watchAllFields?.Purchase_Type === "Services" && (
              <>
                <Grid item xs={12} sx={{ my: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      my: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: 15,
                        mr: 6.5,
                        pl: 1,
                        borderLeft: "3px solid red",
                      }}
                    >
                      Upload Detailed Description of Deliverable(s):
                    </Typography>

                    {allAttachments?.Services_File_Name?.id ? (
                      <Box
                        sx={{
                          display: "flex",
                        }}
                      >
                        <Tooltip
                          title={allAttachments?.Services_File_Name.name}
                          placement="top"
                        >
                          <Typography
                            sx={{
                              color: "blue",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleAttachmentPreview(
                                allAttachments?.Services_File_Name?.id,
                                allAttachments?.Services_File_Name.name
                              )
                            }
                          >
                            {allAttachments?.Services_File_Name.name}
                          </Typography>
                        </Tooltip>

                        <RemoveCircleOutlineOutlinedIcon
                          onClick={() => {
                            setDeletedAttachmentObj({
                              type: "Services_File_Name",
                              value: allAttachments?.Services_File_Name,
                            });

                            handleOpenModal();
                          }}
                          sx={{
                            "&:hover": {
                              cursor: "pointer",
                            },
                            color: "#ed2f4f",
                            ml: 2,
                          }}
                        />
                      </Box>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => {
                          setAllAttachments({
                            ...allAttachments,
                            Services_File_Name: e.target.files[0],
                          });
                          // setFileList(e.target.files[0]);
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              </>
            )}
            <Grid item xs={12} sx={{ mb: 2 }}>
              {watchAllFields?.Terms === "Advanced Payment" &&
                (allAttachments?.Advance_Payment_File_Name?.id ? (
                  <Box
                    sx={{
                      display: "flex",
                      my: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: 15,
                        mr: 2,
                        pl: 1,
                        borderLeft: "3px solid red",
                      }}
                    >
                      Uploaded Invoice For Requested Advanced Payment:
                    </Typography>

                    <Tooltip
                      title={allAttachments?.Advance_Payment_File_Name.name}
                      placement="top"
                    >
                      <Typography
                        sx={{
                          color: "blue",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleAttachmentPreview(
                            allAttachments?.Advance_Payment_File_Name?.id,
                            allAttachments?.Advance_Payment_File_Name.name
                          )
                        }
                      >
                        {allAttachments?.Advance_Payment_File_Name.name}
                      </Typography>
                    </Tooltip>

                    <RemoveCircleOutlineOutlinedIcon
                      onClick={() => {
                        setDeletedAttachmentObj({
                          type: "Advance_Payment_File_Name",
                          value: allAttachments?.Advance_Payment_File_Name,
                        });
                        handleOpenModal();
                      }}
                      sx={{
                        "&:hover": {
                          cursor: "pointer",
                        },
                        color: "#ed2f4f",
                        ml: 2,
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                    }}
                  >
                    <Box
                      sx={{
                        marginTop: "10px",
                        marginRight: "3px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 15,
                          mr: 2,
                          pl: 1,
                          borderLeft: "3px solid red",
                        }}
                        htmlFor="invoiceAttachment"
                      >
                        Upload Invoice For Requested Advanced Payment:
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <input
                        type="file"
                        id="invoiceAttachment"
                        onChange={(e) => {
                          setAllAttachments({
                            ...allAttachments,
                            Advance_Payment_File_Name: e.target.files[0],
                          });
                          // setInvoiceAttachment(e.target.files[0]);
                        }}
                        name="file"
                      />
                    </Box>
                  </Box>
                ))}
            </Grid>

            <Grid item xs={12} sx={{ display: "flex" }}>
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
                        sx={{
                          width: 300,
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
                        getOptionLabel={(option) => option}
                        onChange={(_, data) => {
                          if (data) {
                            field.onChange(data);
                            setValue("WO", null);
                            setValue("Explanations", null);
                          } else {
                            field.onChange(null);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={errorMap?.includes("Owner")}
                            InputLabelProps={{ shrink: true }}
                            label="Continuation for PO Number"
                          />
                        )}
                      />
                    );
                  }}
                />
              )}
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
                        sx={{
                          width: 300,
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
                        getOptionLabel={(option) => option}
                        onChange={(_, data) => {
                          if (data) {
                            field.onChange(data);
                            setValue("PO", null);
                            setValue("Explanations", null);
                          } else {
                            field.onChange(null);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // error={errorMap?.includes("Owner")}
                            InputLabelProps={{ shrink: true }}
                            label="PO Request for Work Order Number"
                          />
                        )}
                      />
                    );
                  }}
                />
              )}
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
                          onChange={(e) => {
                            if (e.target.value) {
                              field.onChange(e.target.value);
                              setValue("PO", null);
                              setValue("WO", null);
                            } else {
                              field.onChange(null);
                            }
                          }}
                          sx={{
                            mt: 2,
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
                          fullWidth
                          label="Sole Source Justification Explanation"
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
            <Button
              disabled={loading}
              sx={{ width: 150 }}
              size="small"
              variant="contained"
              type="submit"
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Save"
              )}
            </Button>
          </Box>
        </form>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style1}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: 600,
                minHeight: 200,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                Do you want to remove this file (
                {deletedAttachmentObj?.value?.name}) permanently ?
              </Typography>

              <Box sx={{ display: "flex", mt: 2 }}>
                <Button
                  onClick={handleCloseModal}
                  sx={{ height: 30, width: 70, mr: 2 }}
                  variant="outlined"
                >
                  No
                </Button>
                <Button
                  disabled={deleteLoading}
                  onClick={() =>
                    handleFileDelete(watchAllFields?.attachmentIds)
                  }
                  sx={{ height: 30, width: 70 }}
                  variant="contained"
                >
                  {deleteLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Yes"
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
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
        autoHideDuration={4500}
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
