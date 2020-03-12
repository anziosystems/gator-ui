import {Component, OnInit, ChangeDetectorRef, Inject, AfterViewInit, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import {DialogService} from 'primeng/api';
import * as FileSaver from 'file-saver';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {PeopleTicketComponent} from '../people-ticket/people-ticket.component';
import {filter} from 'rxjs/internal/operators/filter';
import * as go from 'gojs';
const _ = require('lodash');

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.less'],
})
export class OrgChartComponent implements OnInit, AfterViewInit, OnChanges {
  public textReviewer: string = '';
  public arrPeople: any[];
  currentOrg: string;
  textStatus: string = '';
  public diagram: any;
  public model: any;

  ngOnChanges() {
    console.log('ngOnChanges');
  }

  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService,
  ) {
    this.currentOrg = this.gitService.getCurrentOrg();
    if (!this.currentOrg) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.gitService.getLoggedInGitDev()) {
      this.router.navigate(['/login']);
      return;
    }

    let loggedInUser = this.gitService.getLoggedInGitDev().login;

    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.textReviewer = '';
    this.arrPeople = [];
    this.model = {
      class: 'go.TreeModel',
      nodeDataArray: [
        //                {"key":1, "name":"CEO Name", "title":"CEO"},
        {key: 1, name: 'CTO Name'},
      ],
    };
  }

  ngOnInit() {
    this.load();
  }

  public load() {
    let modelTextArea = document.getElementById('mySavedModel') as HTMLTextAreaElement;
    // this.diagram.model = go.Model.fromJson(modelTextArea.value);
    this.gitService.getOrgChart(this.gitService.getCurrentOrg(), true).subscribe(v => {
      this.model.nodeDataArray = JSON.parse(v[0].OrgChart).nodeDataArray;
      this.diagram.model = go.Model.fromJson(v[0].OrgChart);
    });
    // make sure new data keys are unique positive integers
    let lastkey = 1;
    this.diagram.model.makeUniqueKeyFunction = function(model, data) {
      let k = data.key || lastkey;
      while (model.findNodeDataForKey(k)) {
        k++;
      }
      data.key = lastkey = k;
      return k;
    };
  }

  public save() {
    let modelTextArea = document.getElementById('mySavedModel') as HTMLTextAreaElement;
    modelTextArea.value = this.diagram.model.toJson();
    // this.diagram.isModified = true;
    this.gitService.saveOrgChart(this.gitService.getLoggedInGitDev().login, this.gitService.getCurrentOrg(), this.diagram.model.toJson()).subscribe(x => {
      if (x.code === 401) {
        alert('You are not an admin. Ask your admin for help. Or send a mail to help.anziosystems.com');
      } else {
        alert('Org Chart updated!');
      }
    });
  }

  public centerRoot() {
    //this.diagram.scale = 1;
    this.diagram.commandHandler.scrollToPart(this.diagram.findNodeForKey(1));
  }

  public zoomToFit() {
    this.diagram.commandHandler.zoomToFit();
  }

  addDeveloper() {
    this.gitService.ready().then(result => {
      this.gitService.getGitDev4Org(this.gitService.getCurrentOrg()).subscribe(val => {
        if (val) {
          if (val.code === 404) {
            sessionStorage.setItem('statusText', this.textStatus);
            this.router.navigate(['/login']);
          }
        }
        const devs = val.map(item => item.Name + '--' + item.login + '--' + item.AvatarUrl).filter((value, index, self) => self.indexOf(value) === index);
        const developerNames = devs.map(item => {
          const arr = _.split(item, '--');
          if (arr[0] === 'null' || arr[0] === undefined) arr[0] = arr[1]; //some time there is no Name
          return arr[0] + '  -  ' + arr[1];
        });

        this.dialogService
          .open(PeopleTicketComponent, {
            data: {
              options: developerNames,
              items: this.textReviewer.split(', ').filter(x => x),
            },
            width: '50%',
            header: 'Choose Reviewers',
          })
          .onClose.pipe(filter(x => x))
          .subscribe(v => {
            this.textReviewer = v.join(', ');
            this.buildOrg();
          });
      });
    });
  }

  buildOrg() {
    if (this.textReviewer !== '') {
      let arrSelected = this.textReviewer.split(',');
      arrSelected.forEach(e => {
        let person = e.split('-');
        this.arrPeople.push({name: person[0], userName: person[1]});
      });

      let i = this.model.nodeDataArray.length;
      console.log('i = ', i);
      this.arrPeople.forEach(e => {
        let add = true;
        this.model.nodeDataArray.forEach(n => {
          if (n.name.trim() === e.name.trim()) {
            add = false;
          }
        });
        if (add) {
          i++;
          this.model.nodeDataArray.push({
            key: i,
            name: e.name.trim(),
            userid: e.userName.trim(),
            parent: 1,
          });
        }
      });
    }

    this.diagram.model = go.Model.fromJson(this.model);
    // make sure new data keys are unique positive integers
    let lastkey = 1;
    this.diagram.model.makeUniqueKeyFunction = function(model, data) {
      let k = data.key || lastkey;
      while (model.findNodeDataForKey(k)) {
        k++;
      }
      data.key = lastkey = k;
      return k;
    };
    //this.load();
    this.textReviewer = '';
    this.arrPeople = [];
  }

  ngAfterViewInit() {
    let $ = go.GraphObject.make;

    let myDiagram = $(go.Diagram, 'myDiagramDiv', {
      maxSelectionCount: 1, // users can select only one part at a time
      validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
      'clickCreatingTool.archetypeNodeData': {
        // allow double-click in background to create a new node
        name: '(new person)',
        //                title: "(new title)",
        comments: '(new comment)',
      },

      'clickCreatingTool.insertPart': function(loc) {
        // scroll to the new node
        let node = go.ClickCreatingTool.prototype.insertPart.call(this, loc);
        if (node !== null) {
          this.diagram.select(node);
          this.diagram.commandHandler.scrollToPart(node);
          this.diagram.commandHandler.editTextBlock(node.findObject('NAMETB'));
        }
        return node;
      },

      layout: $(go.TreeLayout, {
        treeStyle: go.TreeLayout.StyleLastParents,
        arrangement: go.TreeLayout.ArrangementHorizontal,
        angle: 90,
        layerSpacing: 35,
        // properties for the "last parents":
        alternateAngle: 90,
        alternateLayerSpacing: 35,
        alternateAlignment: go.TreeLayout.AlignmentBus,
        alternateNodeSpacing: 20,
      }),
      'undoManager.isEnabled': true, // enable undo & redo
    });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener('Modified', function(e) {
      // let button = document.getElementById('SaveButton') as HTMLButtonElement;
      // if (button) {
      //   button.disabled = !myDiagram.isModified;
      // }

      let idx = document.title.indexOf('*');

      if (myDiagram.isModified) {
        if (idx < 0) document.title += '*';
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    // auto move child to upper parents if parent node is deleted
    myDiagram.addDiagramListener('SelectionDeleting', function(e) {
      let node = e.subject.first();
      if (node !== null) {
        myDiagram.startTransaction('reparent remove');
        let chl = node.findTreeChildrenNodes();
        // iterate through the children and set their parent key to our selected node's parent key
        while (chl.next()) {
          let emp = chl.value;
          (myDiagram.model as any).setParentKeyForNodeData(emp.data, node.findTreeParentNode().data.key);
        }
        // and now remove the selected node itself
        myDiagram.model.removeNodeData(node.data);
        myDiagram.commitTransaction('reparent remove');
      }
    });

    let levelColors = ['#AC193D', '#2672EC', '#8C0095', '#5133AB', '#008299', '#D24726', '#008A00', '#094AB2'];

    // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
    (myDiagram.layout as any).commitNodes = function() {
      (go.TreeLayout.prototype as any).commitNodes.call(myDiagram.layout); // do the standard behavior
      // then go through all of the vertexes and set their corresponding node's Shape.fill
      // to a brush dependent on the TreeVertex.level value
      myDiagram.layout.network.vertexes.each(function(v: any) {
        if (v.node) {
          let level = v.level % levelColors.length;
          let color = levelColors[level];
          let shape = v.node.findObject('SHAPE');
          if (shape) shape.fill = $(go.Brush, 'Linear', {0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right});
        }
      });
    };

    // when a node is double-clicked, add a child to it
    function nodeDoubleClick(e, obj) {
      let clicked = obj.part;
      if (clicked !== null) {
        let thisemp = clicked.data;
        myDiagram.startTransaction('add employee');
        let newemp = {
          name: '(new person)',
          //                    title: "(new title)",
          comments: '(new comment)',
          parent: thisemp.key,
        };
        myDiagram.model.addNodeData(newemp);
        myDiagram.commitTransaction('add employee');
      }
    }

    // this is used to determine feedback during drags
    function mayWorkFor(node1, node2) {
      if (!(node1 instanceof go.Node)) return false; // must be a Node
      if (node1 === node2) return false; // cannot work for yourself
      if (node2.isInTreeOf(node1)) return false; // cannot work for someone who works for you
      return true;
    }

    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    function textStyle() {
      return {font: '9pt  Segoe UI,sans-serif', stroke: 'white'};
    }

    // This converter is used by the Picture.
    function findHeadShot(key) {
      if (key < 0 || key > 16) return 'images/HSnopic.jpg'; // There are only 16 images on the server

      return 'images/HS' + key + '.jpg';
    }

    // define the Node template
    myDiagram.nodeTemplate = $(
      go.Node,
      'Auto',
      {doubleClick: nodeDoubleClick},
      {
        // handle dragging a Node onto a Node to (maybe) change the reporting relationship
        mouseDragEnter: function(e, node: any, prev) {
          let diagram = node.diagram;
          let selnode = diagram.selection.first();
          if (!mayWorkFor(selnode, node)) return;
          let shape = node.findObject('SHAPE');
          if (shape) {
            shape._prevFill = shape.fill; // remember the original brush
            shape.fill = 'darkred';
          }
        },
        mouseDragLeave: function(e, node: any, next) {
          let shape = node.findObject('SHAPE');
          if (shape && shape._prevFill) {
            shape.fill = shape._prevFill; // restore the original brush
          }
        },
        mouseDrop: function(e, node: any) {
          let diagram = node.diagram;
          let selnode = diagram.selection.first(); // assume just one Node in selection
          if (mayWorkFor(selnode, node)) {
            // find any existing link into the selected node
            let link = selnode.findTreeParentLink();
            if (link !== null) {
              // reconnect any existing link
              link.fromNode = node;
            } else {
              // else create a new link
              diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
            }
          }
        },
      },

      // for sorting, have the Node.text be the data.name
      new go.Binding('text', 'name'),

      // bind the Part.layerName to control the Node's layer depending on whether it isSelected
      new go.Binding('layerName', 'isSelected', function(sel) {
        return sel ? 'Foreground' : '';
      }).ofObject(),

      // define the node's outer shape
      $(go.Shape, 'Rectangle', {
        name: 'SHAPE',
        fill: '#333333',
        stroke: 'white',
        strokeWidth: 3.5,
        // set the port properties:
        portId: '',
        fromLinkable: true,
        toLinkable: true,
        cursor: 'pointer',
      }),

      $(
        go.Panel,
        'Horizontal',
        $(
          go.Picture,
          {
            name: 'Picture',
            desiredSize: new go.Size(50, 50),
            margin: 1.5,
          },
          new go.Binding('source', 'key', findHeadShot),
        ),

        // define the panel where the text will appear
        $(
          go.Panel,
          'Table',
          {
            minSize: new go.Size(130, NaN),
            maxSize: new go.Size(150, NaN),
            margin: new go.Margin(6, 10, 0, 6),
            defaultAlignment: go.Spot.Left,
          },
          $(go.RowColumnDefinition, {column: 2, width: 4}),
          $(
            go.TextBlock,
            textStyle(), // the name
            {
              row: 0,
              column: 0,
              columnSpan: 5,
              font: '12pt Segoe UI,sans-serif',
              editable: true,
              isMultiline: false,
              minSize: new go.Size(5, 16),
            },
            new go.Binding('text', 'name').makeTwoWay(),
          ),
          // $(go.TextBlock, 'Title: ', textStyle(), {row: 1, column: 0}),
          // $(
          //   go.TextBlock,
          //   textStyle(),
          //   {
          //     row: 1,
          //     column: 1,
          //     columnSpan: 4,
          //     editable: true,
          //     isMultiline: false,
          //     minSize: new go.Size(10, 14),
          //     margin: new go.Margin(0, 0, 0, 3),
          //   },
          //   new go.Binding('text', 'userid').makeTwoWay(),
          // ),
          //$(go.TextBlock, textStyle(), { row: 2, column: 0 }, new go.Binding("text", "key", function(v) { return "ID: " + v; })),
          // $(go.TextBlock, textStyle(), { name: "boss", row: 2, column: 3, }, // we include a name so we can access this TextBlock when deleting Nodes/Links
          //new go.Binding("text", "parent", function(v) { return "Boss id: " + v; })),
          /*$(go.TextBlock, textStyle(),  // the comments
                    {
                        row: 3, column: 0, columnSpan: 5,
                        font: "italic 9pt sans-serif",
                        wrap: go.TextBlock.WrapFit,
                        editable: true,  // by default newlines are allowed
                        minSize: new go.Size(10, 14)
                    },
                    new go.Binding("text", "comments").makeTwoWay())*/
        ), // end Table Panel
      ), // end Horizontal Panel
    ); // end Node

    // the context menu allows users to make a position vacant, remove a role and reassign the subtree, or remove a department
    myDiagram.nodeTemplate.contextMenu = $(
      'ContextMenu',
      // $('ContextMenuButton', $(go.TextBlock, 'Vacate Position'), {
      //   click: function(e, obj) {
      //     let node = (obj.part as any).adornedPart;
      //     if (node !== null) {
      //       let thisemp = node.data;
      //       myDiagram.startTransaction('vacate');

      //       // update the key, name, and comments
      //       myDiagram.model.setDataProperty(thisemp, 'name', '(Vacant)');
      //       myDiagram.model.setDataProperty(thisemp, 'comments', '');
      //       myDiagram.commitTransaction('vacate');
      //     }
      //   },
      // }),
      $('ContextMenuButton', $(go.TextBlock, 'Remove'), {
        click: function(e, obj) {
          // reparent the subtree to this node's boss, then remove the node
          let node = (obj.part as any).adornedPart;
          if (node !== null) {
            myDiagram.startTransaction('reparent remove');
            let chl = node.findTreeChildrenNodes();
            // iterate through the children and set their parent key to our selected node's parent key
            while (chl.next()) {
              let emp = chl.value;
              (myDiagram.model as any).setParentKeyForNodeData(emp.data, node.findTreeParentNode().data.key);
            }
            // and now remove the selected node itself
            myDiagram.model.removeNodeData(node.data);
            myDiagram.commitTransaction('reparent remove');
          }
        },
      }),
      // $('ContextMenuButton', $(go.TextBlock, 'Remove Department'), {
      //   click: function(e, obj) {
      //     // remove the whole subtree, including the node itself
      //     let node = (obj.part as any).adornedPart;
      //     if (node !== null) {
      //       myDiagram.startTransaction('remove dept');
      //       myDiagram.removeParts(node.findTreeParts(), true);
      //       myDiagram.commitTransaction('remove dept');
      //     }
      //   },
      // }),
    );

    // define the Link template
    myDiagram.linkTemplate = $(
      go.Link,
      go.Link.Orthogonal,
      {corner: 5, relinkableFrom: true, relinkableTo: true},
      $(go.Shape, {strokeWidth: 1.5, stroke: '#F5F5F5'}), // the link shape,
      $(
        go.Shape, // the arrowhead
        {toArrow: 'standard', strokeWidth: 1.5, fill: '#F5F5F5', stroke: '#F5F5F5'},
      ),
    );

    // support editing the properties of the selected person in HTML
    /*if ((window as any).Inspector) {
            myInspector = new Inspector("myInspector", myDiagram,
            {
                properties: {
                    "key": { readOnly: true },
                    "comments": {}
                }
            });
        }*/

    this.diagram = myDiagram;
    this.load(); // read in the JSON-format data from the "mySavedModel" element
  }
}
