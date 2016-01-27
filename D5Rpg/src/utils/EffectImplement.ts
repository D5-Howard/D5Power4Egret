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

module d5power {
	export class EffectImplement
	{
        public static TYPE_FREAM:number = 0;
        public static TYPE_IMG:number = 1;
        
        public type:number;
		/**
		 * 播放起始帧
		 */ 
		public startFrame:number;
		/**
		 * 主素材资源
		 */ 
		public res:string;
		/**
		 * 不同方向的坐标配置
		 */ 
		private _directionPos:any
		/**
		 * 不同方向的素材方向映射关系
		 */ 
		private _directionMaps:any;
		
		/**
		 * 播放速度
		 */ 
		public playSpeed:number;
		/**
		 * 移动角度
		 */ 
		private _moveAngleMaps:any;
		
		/**
		 * 移动速度
		 */  
		public moveSpeed:number=0;
		
		/**
		 * 最大飞行距离
		 */ 
		public moveDistance:number;
		
		/**
		 * 旋转角度
		 */ 
		private _rotationMaps:any;
		
		/**
		 * 旋转速度
		 */ 
		public rotationSpeed:number=0;
		
		/**
		 * 自动生成子对象速度，可借此与角度计算出子对象的生成位置
		 */ 
		public sonSpeed:number;
		/**
		 * 自动生成子对象的帧
		 */ 
		public sonFrame:number;
		/**
		 * 自动生成子对象的深度（即生成多少次后停止生成）
		 */ 
		public sonFrameDeep:number;
		/**
		 * Alpha变化速度
		 */
		public alphaSpeed:number=0;
		/**
		 * 初始alpha
		 */
		public startAlpha:number=1;
		/**
		 * 缩放速度
		 */
		public zoomSpeed:number=0;
		/**
		 * 生存周期
		 */
		public live:number = 0;
		/**
		 * 自动创建时间间隔，单位毫秒
		 */
		public autoMakeTime:number;
		/**
		 * 自动创建数量
		 */
		public autoMakeNum:number;
		/**
		 * x坐标浮动下限
		 */
		public x_low:number;
		/**
		 * y坐标浮动下限
		 */
		public y_low:number;
		/**
		 * x坐标浮动上限
		 */
		public x_high:number;
		/**
		 * y坐标浮动上限
		 */
		public y_high:number;
		/**
		 * 移动速度浮动下限
		 */
		public speed_low:number=0;
		/**
		 * 移动速度浮动上限
		 */
		public speed_high:number=0;
		/**
		 * 旋转速度浮动下限
		 */
		public rotation_low:number=0;
		/**
		 * 旋转速度浮动上限
		 */
		public rotation_high:number=0;
		/**
		 * 缩放速度浮动下限
		 */
		public zoom_low:number=0;
		/**
		 * 缩放速度浮动上限
		 */
		public zoom_high:number=0;
		/**
		 * 透明变换速度浮动下限
		 */
		public alpha_low:number=0;
		/**
		 * 透明变换速度浮动上限
		 */
		public alpha_high:number=0;
		
		/**
		 * 不同方向的子对象旋转角度映射
		 */ 
		private _sonAngleMaps:any;
		/**
		 * 运动模式 0-默认 1-向目标运行
		 */ 
		public actionMode:number;
		
		/**
		 * 运行模式 0-循环 1-单次
		 */ 
		public runMode:number;
		
		/**
		 * 缩放比
		 */ 
		public zoom:number=1;
		/**
		 * 翻转模式
		 */ 
		private _mirrorMaps:any;
		
		/**
		 * 混合模式开关
		 */ 
		public blendSwitch:number=0;
		
		/**
		 * 子对象散射角度 - 本参数不提供给游戏对象使用，而是供生成时候进行判断
		 */ 
		public sonAngleAdd:number = 0;
		
		/**
		 * 子对象散射个数 - 本参数不提供给游戏对象使用，而是供生成时候进行判断,如为0，应根据散射角度自动计算
		 */ 
		public sonAngleAddNum:number = 0;
		
		/**
		 * 是否在最下层
		 */ 
		public lowLv:number=0;
		
		public constructor(){
                        
		}
		
		public format(xml:any):void
		{
			this.startFrame = xml.startFrame;
			this.res = <string>(xml.res).replace(/\\/g,"/");
            this.type = this.res.substr(this.res.lastIndexOf('.'))=='.json' ? EffectImplement.TYPE_FREAM : EffectImplement.TYPE_IMG;
			this.playSpeed = xml.playSpeed;
			if(this.playSpeed==0)this.playSpeed = 33;
			this.rotationSpeed = xml.rotationSpeed;
			this.sonSpeed = xml.sonSpeed;
			this.sonFrame = xml.sonFrame;
			this.sonFrameDeep = xml.sonFrameDeep;
			this.runMode = xml.runMode;
			this.actionMode = xml.actionMode;
			this.moveSpeed = xml.moveSpeed;
			this.moveDistance = xml.moveDistance;
			this.zoom = xml.zoom;
			this.zoomSpeed = xml.zoomSpeed;
			this.blendSwitch = xml.blendSwitch;
			this.sonAngleAdd = xml.sonAngleAdd;
			this.lowLv = xml.lowLv;
			this.startAlpha = xml.startAlpha;
			this.alphaSpeed = xml.alphaSpeed;
			this.sonAngleAddNum = xml.sonAngleAddNum;
			this.live = parseInt(xml.live);
			this.autoMakeTime = parseInt(xml.autoMakeTime);
			this.autoMakeNum = parseInt(xml.autoMakeNum);
			this.x_low = parseInt(xml.x_low);
			this.y_low = parseInt(xml.y_low);
			this.x_high = parseInt(xml.x_high);
			this.y_high = parseInt(xml.y_high);
			this.speed_low = Number(xml.speed_low);
			this.speed_high = Number(xml.speed_high);
			this.rotation_low = Number(xml.rotation_low);
			this.rotation_high = Number(xml.rotation_high);
			this.zoom_low = Number(xml.zoom_low);
			this.zoom_high = Number(xml.zoom_high);
			this.alpha_low = Number(xml.alpha_low);
			this.alpha_high = Number(xml.alpha_high);
            
            this._directionPos = [];
			this._directionMaps = [];
			this._moveAngleMaps = [];
			this._sonAngleMaps = [];
			this._mirrorMaps = [];
			this._rotationMaps = [];
            
			for(var i:number=0,j:number=xml.directionMap.length;i<j;i++)
			{
				var dir:any = xml.directionMap[i];
				this._directionPos[parseInt(dir.direction)] = [parseInt(dir.offsetX),parseInt(dir.offsetY)];
				this._directionMaps[parseInt(dir.direction)] = parseInt(dir.directionMap);
				this._sonAngleMaps[parseInt(dir.direction)] = Number(dir.angleMap);
				this._rotationMaps[parseInt(dir.direction)] = Number(dir.rotationMap);
				this._moveAngleMaps[parseInt(dir.direction)] = Number(dir.moveAngle);
				this._mirrorMaps[parseInt(dir.direction)] = parseInt(dir.mirror);
			}
		}
        
        public getMoveAngle(dir:number):number
        {
            if(this._moveAngleMaps==null || this._moveAngleMaps[dir]==null) return 0;
            return this._moveAngleMaps[dir];
        }
        
        public getSonAngle(dir:number):number
        {
            if(this._sonAngleMaps==null || this._sonAngleMaps[dir]==null) return 0;
            return this._sonAngleMaps[dir];
        }
        
        public getRotation(dir:number):number
		{
			if(this._rotationMaps[dir]==null) return 0;
			return this._rotationMaps[dir];
		}
		
		public getDirectionPos(dir:number):Array<any>
		{
			if(this._directionPos[dir]==null) return [0,0];
			return this._directionPos[dir];
		}
        
        public getDirectionMap(dir:number):number
        {
            if(this._directionMaps[dir]==null) return 0;
            return this._directionMaps[0];
        }
        
        public getDirectionMirror(dir:number):number
        {
            if(this._mirrorMaps[dir]==null) return 0;
            return this._mirrorMaps[dir];
        }
	}
}