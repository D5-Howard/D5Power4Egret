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
 * Created by Administrator on 2015/6/11.
 */
module d5power {
    export class CharacterStuff extends egret.Shape
    {
        /**
         * 控制目标
         */
        protected _target:any;
        /**
         * 控制属性的变量名
         */
        protected _attName:string;
        /**
         * 控制属性的最大值的变量名
         */
        protected _attMaxName:string;

        /**
         * @param	target		所属游戏对象
         * @param	resource	渲染素材
         * @param	attName		挂接的游戏对象属性
         * @param	attMaxName	如果挂接属性有最大值，进行挂接
         */
        public constructor(target:any,attName:string='',attMaxName:string='')
        {
            super();
            this._target = target;

            if(attName!='' && this._target.hasOwnProperty(attName)) this._attName = attName;
            if(attMaxName!= '' && this._target.hasOwnProperty(attMaxName)) this._attMaxName = attMaxName;
        }
        /**
         * 渲染
         */
        public render(buffer:egret.Texture):void{}

        /**
         * 清空
         */
        public clear():void
        {

        }
    }
}