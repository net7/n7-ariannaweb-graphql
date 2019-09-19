  import * as Helpers from './helpers';


  let allPossibleFieldKeys = [
    'Campo 123', 'Campo', 'Campo ABC', 'Campo speciale',
    'Campo standard', 'valore', 'info', 'nota'
  ];
  let allPossibleFieldValues = [
    '99', 'Lorem ipsim', 'standard', 'normale', 'medio',
    'elevato', '...', 'attuale', 'vecchio'
  ];



  export function makeRandomFieldGroupId():String{
    return Helpers.getRandomString(3)+"-fieldGroup-"+Helpers.getRandomString(3);
  }

  export function makeRandomFieldId():String{
    return Helpers.getRandomString(3)+"-field-"+Helpers.getRandomString(3);
  }

  export function makeRandomFieldGroups():any {
    let nOfGroups = Helpers.getRandomIntInclusive(0,5);
    if(nOfGroups==0) return null;

    let groups = [];
    for(var i=0;i<nOfGroups;i++){
      let group = {};
      group['id']=makeRandomFieldGroupId();
      group['label']=Helpers.randomPick(['Gruppo A','Gruppo 1']);// add random pick
      group['fields']=[];
      let nOfFields = Helpers.getRandomIntInclusive(1,5);
      for(var j=0;j<nOfFields;j++){
        let field = {};
        field['id']=makeRandomFieldId();
        field['key']=Helpers.randomPick(allPossibleFieldKeys)
        field['value']=Helpers.randomPick(allPossibleFieldValues)
        group['fields'].push(field);
      }
      groups.push(group);
    }
    return groups;
  }