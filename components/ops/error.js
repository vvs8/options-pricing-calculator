import React from 'react'
import styles from '../../components/css/Errors.module.css'


export const showError = (error) => {
    if (error) return (
        <>
            <div className={styles.container}>
                <b>Error: Invalid Input</b>
                <br/>
                <br/>
                {error.map((e, i) => (
                    <p key={i}>{i+1}. {e}.</p>
                ))}
                
            </div>
        </>
    )
    else return null
}