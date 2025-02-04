import React from "react";
import { useState, useEffect } from "react";
import styles from "../css/Loading.module.css";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const Loading = ()=> {
    const [signal, setSignal] = useState(false);
    
    useEffect(() => {
        setTimeout(function(){setSignal(true) }, 100);
    }, [])
    
    return (
       (signal) && (
        <>
        <div className={styles.backg}>
            <div className={styles.lo_title}>
                <div>
                    <div className={styles.spinnerdiv}>
                        <div className={styles.lds_ring}><div></div><div></div><div></div><div></div></div>
                    </div>
                    <Stack spacing={1}>
                        <Skeleton sx={{ width: 275, bgcolor: 'grey.700' }} variant="text" />
                        <Skeleton sx={{ bgcolor: 'grey.700' }} variant="text" />
                        <Skeleton sx={{ bgcolor: 'grey.700' }} variant="text" />
                        <Skeleton sx={{ bgcolor: 'grey.700' }} variant="rectangular" height={118} />
                    </Stack>
                </div>
            </div>
        </div>
        </>
       ) 
       
    )
}

export default Loading;