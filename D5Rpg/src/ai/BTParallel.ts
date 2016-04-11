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
 * Created by Administrator on 2015/5/27.
 */
module d5power {
    export class BTParallel extends BTNode {
        public _type:number;
        protected _results:Array<any>;
        public constructor(type:number,precondition:d5power.BTPrecondition = null) {
            super(precondition);
            this._type = type;
        }
        protected  DoEvaluate ():boolean
        {
            var child:BTNode;
            for(var i:number = 0;i <this.children.length;i++)
            {
                child = this.children[i];
                if (!child.Evaluate()) {
                    return false;
                }
            }
            return true;
        }

        public Tick ():number
        {
            var endingResultCount:number= 0;

            for (var i:number=0; i<this.children.length; i++) {

                if (this._type == BTConst.Parallel_And) {
                    if (this._results[i] == BTConst.BTResult_Running) {
                        this._results[i] = this.children[i].Tick();
                    }
                    if (this._results[i] != BTConst.BTResult_Running) {
                        endingResultCount++;
                    }
                }
                else {
                    if (this._results[i] == BTConst.BTResult_Running) {
                        this._results[i] = this.children[i].Tick();
                    }
                    if (this._results[i] != BTConst.BTResult_Running) {
                        this.ResetResults();
                        return BTConst.BTResult_Ended;
                    }
                }
            }
            if (endingResultCount == this.children.length) {	// only apply to AND func
                this.ResetResults();
                return BTConst.BTResult_Ended;
            }
            return BTConst.BTResult_Running;
        }

        public  Clear():void
        {
            this.ResetResults();

            var child:BTNode;
            for(var i:number = 0;i <this.children.length;i++)
            {
                child = this.children[i];
                child.Clear();
            }
        }

        public AddChild ( aNode:BTNode):void
        {
            super.AddChild (aNode);
            this._results.push(BTConst.BTResult_Running);
        }

        public RemoveChild(aNode:BTNode):void
        {
            var index:number = this._children.indexOf(aNode);
            this._results.splice(index,1);
            super.RemoveChild (aNode);
        }

        private ResetResults ():void
        {
            for (var i:number=0; i<this._results.length; i++) {
                this._results[i] = BTConst.BTResult_Running;
            }
        }
    }
}

