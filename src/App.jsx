import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import Link from "@mui/material/Link"; // Ensure you're importing Link from @mui/material
import PORequestForm from "./Components/PORequestForm";
import logo from "./auttobahn.png";
const ZOHO = window.ZOHO;

function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [zohoInitialized, setZohoInitialized] = useState(false);
  const [prevPoRequest, setPrevPoRequest] = useState(null);
  const [attachmentsPreview, setAttachmentsPreview] = useState([]);
  const [containsPA40Draft, setContainsPA40Draft] = useState(null); // Adjusted to expect an object or null

  useEffect(() => {
    let paData = "";
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      await ZOHO.CRM.API.getRecord({
        Entity: data?.Entity,
        RecordID: data?.EntityId,
      }).then(async function (data) {
        setPrevPoRequest(data?.data[0]);
        paData = data?.data[0];
      });

      await ZOHO.CRM.API.getRelatedRecords({
        Entity: data?.Entity,
        RecordID: data?.EntityId,
        RelatedList: "Attachments",
        page: 1,
        per_page: 200,
      }).then(function (data) {
        const attachments = data?.data || [];
        setAttachmentsPreview(attachments);


        const hasPA40AndDraft = attachments.find(
          (attachment) =>
            attachment.File_Name.toLowerCase().includes(paData?.Name.toLowerCase()) &&
            attachment.File_Name.toLowerCase().includes("draft")
        );
        setContainsPA40Draft(hasPA40AndDraft); // Now storing the object itself
        setInitialLoading(false);
      });

      ZOHO.CRM.UI.Resize({ height: "400", width: "800" });
    });

    ZOHO.embeddedApp.init().then(() => {
      setZohoInitialized(true);
    });
  }, []);

  // Function to handle opening the preview link
  const handlePreviewClick = (url) => {
    const newUrl = "https://crmsandbox.zoho.com" + url;
    // Open the URL in a new tab
    window.open(newUrl, "_blank");
    // Attempting to close the current tab, which might not work in all browsers due to security restrictions
    ZOHO.CRM.UI.Popup.close().then(function (data) {
      console.log(data);
    });
  };

  return (
    <>
      <Box>
        {initialLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 13,
            }}
          >
            <Box>
              <img src={logo} alt="logo" />
              <Typography
                variant="body1"
                sx={{ marginRight: 2 }}
                align="center"
              >
                Please wait while checking the attachments
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <CircularProgress />
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mt: 1, textAlign: "center", mb: 3 }}>
              <img src={logo} alt="logo" />
              {containsPA40Draft && (
                <>
                  <Box sx={{ mt: 1, textAlign: "center", mb: 3 }}>
                    {containsPA40Draft ? (
                      <>
                        <Typography variant="body2" color="success.main">
                          Found {prevPoRequest.Name} and "Draft" in attachments.
                        </Typography>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() =>
                            handlePreviewClick(containsPA40Draft.$previewUrl)
                          }
                        >
                          Preview Draft PA
                        </Link>
                      </>
                    ) : (
                      <Typography variant="body2" color="error.main">
                        "PA - 40" and "Draft" not found in attachments.
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default App;
