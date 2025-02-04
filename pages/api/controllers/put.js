import { putMatrix } from "../functions/bsformulas"

export default function handler(req, res) {
    const data = putMatrix(
        req.body.om,
        req.body.op, 
        req.body.s, 
        req.body.k, 
        req.body.T, 
        req.body.R, 
        req.body.D, 
        req.body.range, 
        req.body.id, 
        req.body.qty, 
        req.body.action, 
        req.body.iv, 
        req.body.ivauto,
        req.body.timedisplay
    )
    res.status(200).json({ data })
}