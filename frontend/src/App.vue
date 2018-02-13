<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div class="well">
            <form>
              <div class="form-group">
                <label for="first_name">First Name</label>
                <input type="text" v-model="input.person.first_name" class="form-control" id="first_name" placeholder="First Name">
              </div>
              <div class="form-group">
                <label for="last_name">Last Name</label>
                <input type="text" v-model="input.person.last_name" class="form-control" id="last_name" placeholder="Last Name">
              </div>
              <button type="button" v-on:click="createPerson()" class="btn btn-default">Save</button>
            </form>
          </div>
        </div>
        <div class="col-md-6">
          <div class="well">
            <form>
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" v-model="input.address.city" class="form-control" id="city" placeholder="City">
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input type="text" v-model="input.address.state" class="form-control" id="state" placeholder="State">
              </div>
              <button type="button" v-on:click="createAddress()" class="btn btn-default">Save</button>
            </form>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <ul class="list-group">
            <li v-for="(person, index) in people" class="list-group-item">
              {{ person.first_name }} {{ person.last_name }} -
              <span v-for="(address, index) in person.addresses">
                {{ address.city }}, {{ address.state }} /
              </span>
              <p>
                <form>
                  <div v-for="(address, index) in addresses">
                    <input type="radio" name="address_id" v-bind:value="address.address_id" v-model="input.address_id"> {{ address.city }}, {{ address.state }}
                  </div>
                  <button type="button" v-on:click="linkAddress(person.person_id)" class="btn btn-default">Save</button>
                </form>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'app',
  data() {
    return {
      input: {
        person: {
          first_name: '',
          last_name: '',
        },
        address: {
          city: '',
          state: '',
        },
        address_id: '',
      },
      people: [],
      addresses: [],
    }
  },
  mounted() {
    axios({ method: 'GET', url: '/api/people' })
      .then((result) => {
        this.people = result.data
      });
    axios({ method: 'GET', url: '/api/addresses' })
      .then((result) => {
        this.addresses = result.data
      });
  },
  methods: {
    createPerson() {
      if (this.input.person.first_name && this.input.person.last_name) {
        axios({
          method: 'POST',
          url: '/api/person',
          data: this.input.person,
          headers: { 'content-type': 'application/json' },
        })
          .then((result) => {
            this.people.push(result.data)
            this.input.person.first_name = ''
            this.input.person.last_name = ''
          });
      }
    },
    createAddress() {
      if (this.input.address.city && this.input.address.state) {
        axios({
          method: 'POST',
          url: '/api/address',
          data: this.input.address,
          headers: { 'content-type': 'application/json' },
        })
          .then((result) => {
            this.addresses.push(result.data)
            this.input.address.city = ''
            this.input.address.state = ''
          });
      }
    },
    linkAddress(person_id) {
      if (this.input.address_id && person_id) {
        axios({
          method: 'PUT',
          url: `/api/person/address/${person_id}`,
          data: { address_id: this.input.address_id },
          headers: { 'content-type': 'application/json' },
        })
          .then((result) => {
            for (let i = 0; i < this.people.length; i++) {
              if (this.people[i].person_id === person_id) {
                if (this.people[i].addresses === undefined) {
                  this.people[i].addresses = []
                }
                axios({
                  method: 'GET',
                  url: `/api/address/${this.input.address_id}`,
                })
                  .then((result) => {
                    this.people[i].addresses.push(result.data)
                    this.input.address_id = ''
                  });
              }
            }
          });
      }
    },
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
