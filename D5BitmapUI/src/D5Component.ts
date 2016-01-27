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
    export class D5Component extends egret.Sprite 
    {
        public static autoRelease:boolean=true;

        protected _w:number;
        protected _h:number;
        protected _nowName:string;
        public constructor()
        {
            super();
            if(D5Component.autoRelease) this.addEventListener(egret.Event.REMOVED_FROM_STAGE,this.dispose,this);
        }

        public setSkin(name:string):void
        {
            
        }
        protected static _pro_binding_source:IUserInfoContainer;
        /**
         * 属性绑定目标
         */
        public static setproBindingSource(obj:IUserInfoContainer):void
        {
            this._pro_binding_source = obj;
        }

        public static  get proBindingSource():IUserInfoContainer
        {
            return this._pro_binding_source;
        }

        public setSize(w:number,h:number):void
        {
            this._w = w;
            this._h = h;
            this.invalidate();
        }
        public get nowName():string
        {
            return this._nowName;
        }
        public get width():number
        {
            return this._w;
        }
        public get height():number
        {
            return this._h;
        }
        public static getComponentByURL(url:any,container:egret.DisplayObjectContainer,onComplate:Function = null):void
        {
            //var obj:any = RES.getRes(url)
            var obj:any = url;
            var arr:Array<any> = obj.uiList;
            var length:number = arr.length;
            var comObj:any;
            container['_realWidth'] = parseInt(obj.width);
            container['_realHeight'] = parseInt(obj.height);
            container['_flyX'] = obj.flyx;
            container['_flyY'] = obj.flyy;
            for(var i:number = 0;i < length;i++)
            {
                comObj = arr[i];
                container.addChild(this.getCompoentByJson(comObj,container));
            }
            if(onComplate) onComplate.apply(container);
        }
        public static getCompoentByJson(value:any,container:egret.DisplayObjectContainer):any
        {
            var com:D5Component;
            switch(value.Class)
            {
                case "D5Window":
                    com = new d5power.D5Window();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    com.setSize(value.width,value.height);
                    var arr:Array<any> = value.uiList;
                    var length:number = arr.length;
                    var comObj:any;
                    for(var i:number = 0;i < length;i++)
                    {
                        comObj = arr[i];
                        com.addChild(this.getCompoentByJson(comObj,container));
                    }
                    if(container) container[com.name] = com;
                    break;
                case "D5MirrorBox":
                    com = new d5power.D5MirrorBox();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    com.setSize(value.width,value.height);
                    var arr:Array<any> = value.uiList;
                    var length:number = arr.length;
                    var comObj:any;
                    for(var i:number = 0;i < length;i++)
                    {
                        comObj = arr[i];
                        com.addChild(this.getCompoentByJson(comObj,container));
                    }
                    if(container) container[com.name] = com;
                    break;
                case "D5Button":
                    com = new d5power.D5Button();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    (<D5Button>com).setSound(value.soundDown)
                    com.x = value.x;
                    com.y = value.y;
                    (<D5Button>com).setIcon(value.icon)
                    var callback_String:string = value.listener;
                    if(value.lable&&value.lable!='')
                    {
                        (<D5Button>com).setLable(value.lable);
                    }
                    if(callback_String!='' && callback_String!='null' && callback_String!=null && container!=null)
                    {
//                        if(container.hasOwnProperty(callback_String))
//                        {
//                        (<D5Button>com).setCallback(container[callback_String]);
//                        }else{
//                            trace("[D5Component] 未在"+container+"中发现所需要的按钮响应函数"+callback_String);
//                        }
                        (<D5Button>com).setCallback(container[callback_String]);
                    }
                    if(container) container[com.name] = com;
                    break;
                case "D5MirrorLoop":
                    com = new d5power.D5MirrorLoop();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    com.setSize(value.width,value.height);
                    if(container) container[com.name] = com;
                    break;
                case "D5Bitmap":
                    com = new d5power.D5Bitmap();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    if(container) container[com.name] = com;
                    break;
                case "D5RadioBtn":
                    com = new d5power.D5RadioBtn();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    if(value.lable&&value.lable!='')
                    {
                        (<D5RadioBtn>com).setLable(value.lable);
                    }
                    if(container) container[com.name] = com;
                    break;
                case "D5FlyBox":
                    com = new d5power.D5FlyBox();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    (<D5FlyBox>com).setMaxWidth((<number>value.maxWidth));
                    if(container) container[com.name] = com;
                    break;
                case "D5HBox":
                    com = new d5power.D5HBox();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    if(container) container[com.name] = com;
                    break;
                case "D5VBox":
                    com = new d5power.D5VBox();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    if(container) container[com.name] = com;
                    break;
                case "D5Text":
                    com = new d5power.D5Text(value.textValue,value.fontColor,-1,value.filterColor,value.fontSize);
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    com.setSize(value.width,value.height);
                    (<D5Text>com).setType(value.type);
                    (<D5Text>com).setTextAlign(value.alignType);
                    (<D5Text>com).setFontBold((<boolean>value.bold));
                    (<D5Text>com).setBgColor(value.bgColor);
                    (<D5Text>com).setLtBorder(value.ltColor);
                    (<D5Text>com).setRbBorder(value.rbColor);
                    (<D5Text>com).setWrapFlg(value.wrapType);
                    (<D5Text>com).setIsPassword((<boolean>value.password));
                    (<D5Text>com).setTextID((value.textID).toString());
                    (<D5Text>com)._binding = value.binding;
                    if(container) container[com.name] = com;
                    if(container && <IProBindingContainer><any>container && (<D5Text>com)._binding!='') (<IProBindingContainer><any>container).addBinder(<D5Text>com);
                    break;
                case "D5ImageBox":
                    com = new d5power.D5ImageBox();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    com.setSize(value.width,value.height);
                    (<D5ImageBox>com).showNum(<boolean>value.shownum);
                    (<D5ImageBox>com).setLogo((value.bg).toString());
                    if(container) container[com.name] = com;
                    break;
                case "D5ButtonGroup":
                    com = new d5power.D5ButtonGroup();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    var arr:Array<any> = value.uiList;
                    var length:number = arr.length;
                    var comObj:any;
                    for(var i:number = 0;i < length;i++)
                    {
                        comObj = arr[i];
                        com.addChild(this.getCompoentByJson(comObj,container));
                    }
                    if(container) container[com.name] = com;
                    break;
                case "D5Swf":
                    com = new d5power.D5Swf();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    (<D5Swf>com).setSrc(value.src);
                    if(container) container[com.name] = com;
                    break;
                case "D5BitmapNumber":
                    com = new d5power.D5BitmapNumber();
                    com.name = value.name;
                    com.setSkin(value.skinId);
                    com.x = value.x;
                    com.y = value.y;
                    //(<D5BitmapNumber>com).setPadding(value.src);
                    (<D5BitmapNumber>com).setAlign(value.align);
                    (<D5BitmapNumber>com).setValue(1);
                    if(container) container[com.name] = com;
                    break;
                case "D5Shape":
                    com = new d5power.D5Shape();
                    com.name = value.name;
                    com.x = value.x;
                    com.y = value.y;
                    (<D5Shape>com).setWorkMode(value.workMode);
                    (<D5Shape>com).setFillColor(value.fillColor);
                    (<D5Shape>com).setTickNess(value.tickNess);
                    (<D5Shape>com).setColor(value.color);
                    (<D5Shape>com).setOffX(value.offX);
                    (<D5Shape>com).setOffY(value.offY);
                    (<D5Shape>com).setSize(value.width,value.height);
                    (<D5Shape>com).setRadius(value.radius);
                    if(container) container[com.name] = com;
                    break;
            }
            return com;
        }

        public dispose():void
        {

        }

        protected invalidate():void
        {
            this.addEventListener(egret.Event.ENTER_FRAME, this.onInvalidate,this);
        }

        private onInvalidate(event:egret.Event):void
        {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onInvalidate,this);
            this.draw();
        }

        public draw():void
        {
            this.invalidateSize();
            this.dispatchEvent(new egret.Event(egret.Event.RESIZE));
        }
        
        public invalidateSize(): void 
        {
        }
        

        protected autoCache():void
        {
            this.cacheAsBitmap=false;
            this.addEventListener(egret.Event.ENTER_FRAME, this.onAutoCache,this);
        }

        private onAutoCache(event:Event):void
        {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onAutoCache,this);
            this.cacheAsBitmap=true;
        }

    }
}