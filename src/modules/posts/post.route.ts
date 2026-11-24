import { Router } from "express";

const router=Router()

router.post('/',()=>{
    console.log('Post')
})

export const postRouter=router