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
/**
 * Created by Administrator on 2015/5/29.
 */
module d5power
{
    export interface IFighter {
        pushTo(pushDis:number,pushA:number):void;

        setAtkSpeedTemp(value:number):void;

        setAtkSpeed(value:number):void;

        fightDis:number;

        Pos:egret.Point;

        setAction(v:number):void;

        atkSpeed:number;

        setAtkSpeed(v:number):void;

        lastAtk:number;

        atk:number;

        def:number;

        camp:number;

        vit:number;

        str:number;

        agi:number;

        dex:number;

        cri:number;

        job:number;

        luk:number;

        rpos:number;

        viewTarget:IFighter;

        setTarget(v:IFighter):void;

        target:IFighter;

        int:number;

        changeHp():void;

        //baseKongfu:number;

        hurt(v:number, doer:IFighter):void

        controller:any;

        removeAllBuff():void;

        hp:number;

        sp:number;
        
        getIGD:d5power.IGD;

        setHp(value:number):void;

        setSp(value:number):void;

        hasEqu(value:number);

        delItem(id:number,num:number):boolean;

        giveBuff(id:number,doer:IFighter):void

        quiteFight():void;

        $playEffectNow(eff_name:string):void;
    }
}