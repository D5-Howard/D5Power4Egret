//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, MicroGame Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
module d5power
{
    /**
     * 游戏对象基础数据
     */
    export interface IGD
    {
        /**
         * 重算坐标
         */
        run():void;
        /**
         * 当前坐标
         */
        $pos:egret.Point;
        /**
         * 当前X坐标
         */
        posX:number;
        /**
         * 当前Y坐标
         */
        posY:number;

        zOrder:number;

        linkMap:number;

        linkPosx:number;

        linkPosy:number;

        missionIndex:number;

        missionIndexList:Array<number>;
        /**
         * 设置坐标
         * @param px
         * @param py
         */
        setPos(px:number,py:number):void;
        /**
         * 控制器
         */
        controller:IController;

        setController(ctrl:IController):void;

        /**
         * 设置角色素材
         * @param v 要使用的角色素材
         */
        setRespath(v:string):void;

        respath:string;

        /**
         * 设置角色素材集
         * @param dir   素材集所在目录
         */
        setResStyle(dir:string):void;

        resStyle:string;

        setNickname(v:string):void;

        nickname:string;

        dispose():void;

        deleting:boolean;

        setDeleting(v:boolean):void

        setInScreen(v:boolean):void

        inScreen:boolean;

        setDisplayer(data:IGO):void

        displayer:IGO;

        setAI(data:BTTree):void

        ai:BTTree;

        setAction(action:number):void;

        action:number;

        setDirection(direction:number):void;

        direction:number;

        speed:number;

        setSpeed(speed:number):void;

        camp:number;

        setCamp(value:number):void;

        setUid(id:number):void

        uid:number;

        setMonsterid(id:number):void

        monsterid:number;

        setSay(say:string):void;

        say:string;

        setScript(script:string):void;

        script:string;

        setJob(type:number,value:string,num:string):void;

        setLink(mapid:number,posx:number,posy:number):void;

        job_type:number;

        job_value:string;

        job_number:string;

        setWork(work:number):void;

        work:number;

        loadMission():void;

        renderMe():void;

        hp:number;

        setHp(value:number):void;

        sp:number;

        setSp(value:number):void;

        maxHp:number;

        setMaxHp(value:number):void;
        
        setMaxSp(value:number):void;
        
        inG: boolean;
        
        speedX: number;
        
        speedY: number;

        isDB:number;

        setIsDB(value:number):void;

        checktime:number;

        setChecktime(value:number):void;

        checksize:number;

        setChecksize(value:number):void;

        checkdel:number;

        setCheckdel(value:number):void;
    }
}