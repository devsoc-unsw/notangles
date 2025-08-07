import React, { useContext, useState, useRef, useEffect } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { API_URL } from '../../api/config';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { UserContext } from '../../context/UserContext';
import { emptyProfile } from './groupsSidebar/friends/UserProfile'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'
import { Button, styled } from '@mui/material'

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

const MAX_FILE_SIZE_BYTES = 2000000;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledContainer = styled('div')({
  margin: '20px 0',
  padding: '0 20px'
});

const StyledPromptText = styled('div')({
  fontWeight: 'bold',
  marginBottom: '10px',
})

const fileButtonProps = {
  marginTop: '30px',
  textTransform: 'none',
  fontSize: '16px',
}

const removeButtonProps = {
  marginTop: '30px',
  marginLeft: '10px',
  textTransform: 'none',
  fontSize: '16px',
}

const saveButtonProps = {
  marginTop: '10px',
  textTransform: 'none',
  fontSize: '16px',
  width: '100%'
}

const StyledReactCrop = styled(ReactCrop)`
  width: 100%;
  
  & * {
    width: 100%;
  }
`;

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function App() {
  const [currentImgSrc, setCurrentImgSrc] = useState('')
  const [newImgSrc, setNewImgSrc] = useState('')

  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const aspect = 1;
  const blobUrlRef = useRef('')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const [errorMsg, setErrorMsg] = useState('');

  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    setCurrentImgSrc(user.profileURL || emptyProfile);
  }, [user, user.profileURL])

  const CustomDialog = () => (
    <Dialog open={isDialogOpen}>
      <DialogTitle>Are you sure you want to reset your current avatar?</DialogTitle>
      <DialogActions>
        <Button autoFocus onClick={() => setIsDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleDelete}>Ok</Button>
      </DialogActions>
    </Dialog>
  )

  function onRemovePhoto() {
    setIsDialogOpen(true);
  }

  function handleDelete() {
    postNewProfilePicture('');
    setSuccessAlertOpen(true);
    setCurrentImgSrc(emptyProfile);
    setNewImgSrc('');
    setIsDialogOpen(false);
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > MAX_FILE_SIZE_BYTES) {
        setIsErrorAlertOpen(true);
        setErrorMsg('File size exceeds 2MB. Try uploading a smaller file.');
        return;
      }

      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setNewImgSrc(reader.result?.toString() || '');
      });
      reader.addEventListener('error', () => {
        setIsErrorAlertOpen(true);
        setErrorMsg('Error reading file, please try again');
        setNewImgSrc('');
        return;
      })

      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspect))
  }

  function getCroppedProfileV2() {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          setCurrentImgSrc(URL.createObjectURL(blob));

          // blob to base64 string
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            if (reader.result) {
              setCurrentImgSrc(reader.result.toString());
            }
          }
        }
      });
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
        )
      }
    },
    100,
    [completedCrop],
  )

  function onSubmit() {
    getCroppedProfileV2();
    postNewProfilePicture(currentImgSrc);

    setCurrentImgSrc(blobUrlRef.current);
    setNewImgSrc('');
    setSuccessAlertOpen(true);
    setCrop(undefined)
    setCompletedCrop(undefined);
  }

  async function postNewProfilePicture(imgSrc: string) {
    try {
      await fetch(`${API_URL.server}/user/profile/picture`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imgSrc,
        }),
        credentials: 'include',
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <StyledContainer>
      {!newImgSrc && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {/* User's current profile picture */}
          <img
            src={currentImgSrc}
            style={{ width: '200px', height: '200px', borderRadius: 999, backgroundColor: 'white' }}
          />
        </div>
      )}
      {!!newImgSrc && (
        <>
          <StyledPromptText>Crop your new profile picture:</StyledPromptText>
          <StyledReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={100}
            minHeight={100}
            circularCrop
          >
            <img
              ref={imgRef}
              src={newImgSrc}
              onLoad={onImageLoad}
            />
          </StyledReactCrop>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!completedCrop && <>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            sx={fileButtonProps}
          >
            Choose file
            <VisuallyHiddenInput
              type="file"
              onChange={onSelectFile}
              accept="image/*"
            />
          </Button>
          <Button
            onClick={onRemovePhoto}
            variant="contained"
            sx={removeButtonProps}
            disableElevation
          >
            Remove photo
          </Button>
        </>}
        {!!completedCrop && (
          <Button
            onClick={onSubmit}
            variant="contained"
            sx={saveButtonProps}
            disableElevation
          >
            Set new profile picture
          </Button>
        )}
      </div>

      <Snackbar open={successAlertOpen} autoHideDuration={6000} onClose={() => setSuccessAlertOpen(false)}>
        <Alert
          onClose={() => setSuccessAlertOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <AlertTitle>Success</AlertTitle>
          Profile picture updated!
        </Alert>
      </Snackbar>

      <Snackbar open={isErrorAlertOpen} autoHideDuration={6000} onClose={() => setIsErrorAlertOpen(false)}>
        <Alert
          onClose={() => setIsErrorAlertOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <AlertTitle>Error</AlertTitle>
          {errorMsg}
        </Alert>
      </Snackbar>

      <CustomDialog />

      <div style={{ display: 'none' }}>
        <canvas
          ref={previewCanvasRef}
        />
      </div>
    </StyledContainer>
  )
}
